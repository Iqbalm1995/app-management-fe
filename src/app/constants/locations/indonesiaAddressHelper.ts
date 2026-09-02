import provincesData from "./provinces.json";
import regenciesData from "./regencies.json";
import districtsData from "./districts.json";

export interface ProvinceOption {
  id: string;
  name: string;
  kemendagri_code?: string;
}

export interface RegencyOption {
  id: string;
  province_id: string;
  name: string;
  kemendagri_code?: string;
}

export interface DistrictOption {
  id: string;
  regency_id: string;
  name: string;
  postal_code?: string;
}

export interface LocationSearchResult {
  province: string;
  regency: string;
  district?: string;
  postalCode?: string;
}

export interface SelectItemOption {
  value: string;
  label: string;
}

// Full 38 Provinces
export const getProvinces = (): ProvinceOption[] => {
  return (provincesData as ProvinceOption[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

export const getProvinceSelectOptions = (): SelectItemOption[] => {
  return getProvinces().map((p) => ({
    value: p.name,
    label: p.name,
  }));
};

export const findProvinceByName = (
  provinceName: string
): ProvinceOption | undefined => {
  if (!provinceName) return undefined;
  const normalized = provinceName.trim().toUpperCase();
  return (provincesData as ProvinceOption[]).find(
    (p) =>
      p.name.toUpperCase() === normalized ||
      p.name.toUpperCase().includes(normalized) ||
      normalized.includes(p.name.toUpperCase())
  );
};

// Regencies filtered by Province ID or Name
export const getRegenciesByProvinceId = (
  provinceId: string
): RegencyOption[] => {
  if (!provinceId) return [];
  return (regenciesData as RegencyOption[])
    .filter((r) => r.province_id === provinceId)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getRegenciesByProvinceName = (
  provinceName: string
): RegencyOption[] => {
  if (!provinceName) return [];
  const prov = findProvinceByName(provinceName);
  if (!prov) return [];
  return getRegenciesByProvinceId(prov.id);
};

export const getRegencySelectOptions = (
  provinceName: string
): SelectItemOption[] => {
  return getRegenciesByProvinceName(provinceName).map((r) => ({
    value: r.name,
    label: r.name,
  }));
};

export const findRegencyByName = (
  provinceName: string,
  regencyName: string
): RegencyOption | undefined => {
  if (!regencyName) return undefined;
  const regencies = getRegenciesByProvinceName(provinceName);
  const normalized = regencyName.trim().toUpperCase();
  return (
    regencies.find(
      (r) =>
        r.name.toUpperCase() === normalized ||
        r.name.toUpperCase().includes(normalized) ||
        normalized.includes(r.name.toUpperCase())
    ) ||
    (regenciesData as RegencyOption[]).find(
      (r) =>
        r.name.toUpperCase() === normalized ||
        r.name.toUpperCase().includes(normalized) ||
        normalized.includes(r.name.toUpperCase())
    )
  );
};

// Districts filtered by Regency ID or Name
export const getDistrictsByRegencyId = (
  regencyId: string
): DistrictOption[] => {
  if (!regencyId) return [];
  return (districtsData as DistrictOption[])
    .filter((d) => d.regency_id === regencyId)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getDistrictsByRegencyName = (
  provinceName: string,
  regencyName: string
): DistrictOption[] => {
  if (!regencyName) return [];
  const reg = findRegencyByName(provinceName, regencyName);
  if (!reg) return [];
  return getDistrictsByRegencyId(reg.id);
};

export const getDistrictSelectOptions = (
  provinceName: string,
  regencyName: string
): SelectItemOption[] => {
  return getDistrictsByRegencyName(provinceName, regencyName).map((d) => ({
    value: d.name,
    label: d.postal_code ? `${d.name} (${d.postal_code})` : d.name,
  }));
};

export const findDistrictByName = (
  provinceName: string,
  regencyName: string,
  districtName: string
): DistrictOption | undefined => {
  if (!districtName) return undefined;
  const districts = getDistrictsByRegencyName(provinceName, regencyName);
  const normalized = districtName.trim().toUpperCase();
  return districts.find(
    (d) =>
      d.name.toUpperCase() === normalized ||
      d.name.toUpperCase().includes(normalized) ||
      normalized.includes(d.name.toUpperCase())
  );
};

export interface SubDistrictOption {
  id: string;
  district_id: string;
  name: string;
  postal_code?: string;
}

const regencyVillagesCache: Record<string, SubDistrictOption[]> = {};

export const fetchSubDistrictsByDistrict = async (
  provinceName: string,
  regencyName: string,
  districtName: string
): Promise<SelectItemOption[]> => {
  if (!provinceName || !regencyName || !districtName) return [];
  const regency = findRegencyByName(provinceName, regencyName);
  const district = findDistrictByName(provinceName, regencyName, districtName);
  if (!regency || !district) return [];

  try {
    let list = regencyVillagesCache[regency.id];
    if (!list) {
      const response = await fetch(`/data/indonesia/subdistricts/${regency.id}.json`);
      if (response.ok) {
        list = await response.json();
        regencyVillagesCache[regency.id] = list;
      }
    }

    if (!list || !Array.isArray(list)) {
      return [];
    }

    const matched = list
      .filter((v) => v.district_id === district.id)
      .map((v) => ({
        value: v.name.toUpperCase(),
        label: v.postal_code ? `${v.name.toUpperCase()} (${v.postal_code})` : v.name.toUpperCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return matched;
  } catch (err) {
    console.error("Error fetching subdistricts:", err);
    return [];
  }
};

export const getPostalCodeForSubDistrict = (
  provinceName: string,
  regencyName: string,
  districtName: string,
  subDistrictName: string
): string => {
  if (!subDistrictName) return "";
  const regency = findRegencyByName(provinceName, regencyName);
  const district = findDistrictByName(provinceName, regencyName, districtName);
  if (!regency || !district) return "";

  const list = regencyVillagesCache[regency.id];
  if (!list) return "";

  const normalized = subDistrictName.trim().toUpperCase();
  const matched = list.find(
    (v) =>
      v.district_id === district.id &&
      (v.name.toUpperCase() === normalized ||
        v.name.toUpperCase().includes(normalized) ||
        normalized.includes(v.name.toUpperCase()))
  );

  return matched?.postal_code || "";
};

export const getPostalCodeForDistrict = (
  provinceName: string,
  regencyName: string,
  districtName: string
): string => {
  if (!districtName) return "";
  const districts = getDistrictsByRegencyName(provinceName, regencyName);
  const normalized = districtName.trim().toUpperCase();
  const d = districts.find(
    (item) =>
      item.name.toUpperCase() === normalized ||
      item.name.toUpperCase().includes(normalized) ||
      normalized.includes(item.name.toUpperCase())
  );
  return d?.postal_code || "";
};

// Search by postal code or district/regency name
export const searchLocationByKeyword = (
  keyword: string,
  limit: number = 10
): LocationSearchResult[] => {
  if (!keyword || keyword.trim().length < 2) return [];
  const kw = keyword.trim().toUpperCase();
  const results: LocationSearchResult[] = [];

  // Match postal code
  if (/^\d+$/.test(kw)) {
    const matchedDistricts = (districtsData as DistrictOption[]).filter(
      (d) => d.postal_code && d.postal_code.startsWith(kw)
    );
    for (const d of matchedDistricts.slice(0, limit)) {
      const reg = (regenciesData as RegencyOption[]).find(
        (r) => r.id === d.regency_id
      );
      const prov = reg
        ? (provincesData as ProvinceOption[]).find((p) => p.id === reg.province_id)
        : undefined;
      results.push({
        province: prov?.name || "",
        regency: reg?.name || "",
        district: d.name,
        postalCode: d.postal_code || "",
      });
    }
    return results;
  }

  // Match district or regency name
  const matchedDistricts = (districtsData as DistrictOption[]).filter((d) =>
    d.name.includes(kw)
  );
  for (const d of matchedDistricts.slice(0, limit)) {
    const reg = (regenciesData as RegencyOption[]).find(
      (r) => r.id === d.regency_id
    );
    const prov = reg
      ? (provincesData as ProvinceOption[]).find((p) => p.id === reg.province_id)
      : undefined;
    results.push({
      province: prov?.name || "",
      regency: reg?.name || "",
      district: d.name,
      postalCode: d.postal_code || "",
    });
  }

  return results;
};
