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

export interface ListSearchByParam {
  key: string;
  operator: "%" | "=" | ">" | "<" | ">=" | "<=";
  values: string;
}

export interface OptionListProps {
  value: string;
  label: string;
}

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
