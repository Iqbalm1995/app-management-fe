export interface OptionData {
  value: string;
  label: string;
}

export interface ApiGenericResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
  count?: number;
  countTotal?: number;
  error?: any; // Optional error message, present only in case of an error
}

export interface ResListData<T> {
  items: T;
  size: ResSizePaging;
}

export interface ResListDetailData<T> {
  items: T;
}

export interface ResSizePaging {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PaggingListPayload {
  search: string;
  limit: number;
  page: number;
  filterWhere: ListSearchByParam[];
  fieldOrder: string[];
  orderDir: "asc" | "desc";
}

export interface PaggingListPayloadCustom {
  search: string;
  teamId?: string | null;
  reqId?: string | null;
  backlogId?: string | null;
  limit: number;
  page: number;
  filterWhere: ListSearchByParam[];
  fieldOrder: string[];
  orderDir: "asc" | "desc";
}

export interface ListSearchByParam {
  field: string;
  operator: "%" | "=" | "!=" | ">" | "<" | ">=" | "<=" | "like" | "not like";
  value: string;
}

export const addParamFilter = (
  list: ListSearchByParamProps[],
  param: ListSearchByParamProps
): ListSearchByParamProps[] => {
  const isDuplicate = list.some(
    (p) => p.field === param.field && p.operator === param.operator
  );

  return isDuplicate ? list : [...list, param];
};

export const addParamFilterUpdate = (
  list: ListSearchByParamProps[],
  param: ListSearchByParamProps
): ListSearchByParamProps[] => {
  // Find if a param with same field AND operator exists
  const existing = list.find(
    (p) => p.field === param.field && p.operator === param.operator
  );

  // If found and value is unchanged, return original list
  if (existing && existing.value === param.value) {
    return list;
  }

  // Otherwise, remove existing with same field+operator and append new param
  const updatedList = list.filter(
    (p) => !(p.field === param.field && p.operator === param.operator)
  );

  return [...updatedList, param];
};

export const removeParamFilter = (
  list: ListSearchByParamProps[],
  target: ListSearchByParamProps
): ListSearchByParamProps[] => {
  return list.filter(
    (item) =>
      !(
        item.field === target.field &&
        item.operator === target.operator &&
        item.value === target.value
      )
  );
};

export interface ReturnStatus {
  label: string;
  value: string;
  status: boolean;
}

export interface PasswordValidationResult {
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialCharacter: boolean;
  minLength: boolean;
  noRepeatedChars: boolean;
  passwordsMatch: boolean;
}

export interface FileDetails {
  name: string;
  extension: string;
  size: number;
  file: File; // Adding the file object itself for multipart upload
}

export interface AttachmentProps {
  id: string;
  name: string;
  src: string;
  alt: string;
  extension?: string;
  size?: string;
}

export interface FileDetails {
  name: string;
  extension: string;
  size: number;
  file: File; // Adding the file object itself for multipart upload
}

export interface OptionListProps {
  value: string;
  label: string;
}

// FILTER META DATA

export interface FilterParamProps {
  field: string;
  operator: "%" | "=" | "!=" | ">" | "<" | ">=" | "<=" | "like" | "not like";
  value: string;
  filterType: "text" | "select" | "date";
  filterLabel: string;
  sourceListData?: OptionListProps[]; // for source data select
}

export interface ListSearchByParamProps {
  field: string;
  operator: "%" | "=" | "!=" | ">" | "<" | ">=" | "<=" | "like" | "not like";
  value: string;
  filterLabel: string;
}

export interface SortDataProps {
  field: string;
  dir: "asc" | "desc";
}

export interface ColumnMetaCustom {
  isFilterable?: boolean;
  filterData?: FilterParamProps[];
  sortData?: SortDataProps[];
}

export interface StepsProps {
  title: string;
  description: string;
}
