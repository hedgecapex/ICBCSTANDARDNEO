/**
 * Shared contracts between the client and server.
 */
export interface DemoResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  companyName: string | null;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface AccountSummary {
  accountNumber: string;
  currency: string;
  availableBalance: string;
  accountType: string;
  assetClass?: "cash" | "crypto" | "stablecoin" | "metal" | "diamond";
  quantity?: string;
  unit?: string;
}

export interface DashboardResponse {
  user: AuthUser;
  accounts: AccountSummary[];
}
