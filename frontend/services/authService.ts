import { client } from "@/lib/client";
import { signMessage } from "thirdweb/utils";
import { createWallet } from "thirdweb/wallets";

interface AuthResponse {
  token: string;
  walletAddress: string;
}

interface NonceResponse {
  nonce: string;
}

export class AuthService {
  private backendUrl: string;
  private tokenKey = "bazaar_auth_token";
  private walletAddressKey = "bazaar_wallet_address";

  constructor(backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "") {
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
    }
    this.backendUrl = backendUrl;
  }

  async getNonce(): Promise<string> {
    try {
      const response = await fetch(`${this.backendUrl}/auth/nonce`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to get nonce: ${response.statusText}`);
      }

      const data = (await response.json()) as NonceResponse;
      return data.nonce;
    } catch (error) {
      console.error("Error fetching nonce:", error);
      throw error;
    }
  }

  async authenticate(walletAddress: string): Promise<AuthResponse> {
    try {
      const wallet = createWallet("io.metamask");
      const account = await wallet.connect({
        client: client,
      });
      const nonce = await this.getNonce();

      const message = `Sign this message to authenticate: ${nonce}`;
      const signature = await signMessage({
        account,
        message,
      });

      const response = await fetch(`${this.backendUrl}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = (await response.json()) as AuthResponse;

      this.setToken(data.token);
      this.setWalletAddress(data.walletAddress);

      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }
  private setWalletAddress(address: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.walletAddressKey, address);
    }
  }

  getWalletAddress(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.walletAddressKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.walletAddressKey);
    }
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }

  async authenticatedFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(`${this.backendUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      throw new Error("Authentication expired. Please sign in again.");
    }

    return response;
  }
}

const authService = new AuthService();
export default authService;
