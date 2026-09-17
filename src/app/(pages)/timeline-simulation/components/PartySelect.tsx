"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Select, GroupBase, OptionBase } from "chakra-react-select";
import useOrganization from "@/app/services/useOrganization";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import { SimulationParty } from "../types";

interface PartyOption extends OptionBase {
  value: string;
  label: string;
  orgType: string;
}

interface PartySelectProps {
  token: string;
  value: SimulationParty[];
  onChange: (parties: SimulationParty[]) => void;
  placeholder?: string;
}

/**
 * Multi-select of involved parties (divisi / grup / roles) sourced from
 * master-data Organizations, grouped by orgType.
 */
const PartySelect = ({
  token,
  value,
  onChange,
  placeholder = "Select involved parties…",
}: PartySelectProps) => {
  const { List } = useOrganization();
  const [options, setOptions] = useState<PartyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrganizations = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await List(
        {
          search: "",
          limit: 500,
          page: 1,
          filterWhere: [],
          fieldOrder: [],
          orderDir: "asc",
        },
        token
      );
      if (res?.statusCode === RES_CODE_OK && res.data) {
        setOptions(
          res.data.map((o) => ({
            value: o.id,
            label: `${o.orgName} (${o.orgType})`,
            orgType: o.orgType,
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  /** Group flat options by orgType for the grouped dropdown. */
  const grouped = useMemo<GroupBase<PartyOption>[]>(() => {
    const byType = new Map<string, PartyOption[]>();
    for (const opt of options) {
      const list = byType.get(opt.orgType) ?? [];
      list.push(opt);
      byType.set(opt.orgType, list);
    }
    return Array.from(byType.entries()).map(([orgType, opts]) => ({
      label: orgType,
      options: opts,
    }));
  }, [options]);

  const selected = useMemo<PartyOption[]>(
    () =>
      value.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.type})`,
        orgType: p.type,
      })),
    [value]
  );

  return (
    <Select<PartyOption, true, GroupBase<PartyOption>>
      isMulti
      options={grouped}
      value={selected}
      isLoading={isLoading}
      placeholder={placeholder}
      onChange={(opts) =>
        onChange(
          (opts as PartyOption[]).map((o) => ({
            id: o.value,
            type: o.orgType,
            name: o.label.replace(/\s*\([^)]*\)\s*$/, ""),
          }))
        )
      }
      chakraStyles={{
        container: (base) => ({ ...base, width: "100%" }),
      }}
    />
  );
};

export default PartySelect;
