export interface KubeconfigValidationResponse {
  message: string;
  name: string;
  stored: boolean;
  valid: boolean;
}

export interface KubeconfigDeleteResponse {
  message: string;
}

export interface KubeconfigEntry {
  name: string;
  importDate: string;
  status: "valid" | "invalid";
}
