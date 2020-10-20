import axios from "axios";

interface Credentials {
  email: string;
  password: string;
}

export enum LoginType {
  LEGACY,
  NORMAL
}

const LoginTypes = {
  [LoginType.LEGACY]: "https://manage.lemonpi.io/api/v0",
  [LoginType.NORMAL]: "https://api.lemonpi.io"
};

// export const AUTH_TOKEN_LIFETIME = 60 * 15 * 1000; // 15 minutes
export const AUTH_TOKEN_LIFETIME = 1000;

export default class ODCAuthClient implements AuthClient {
  private authentication = null;

  private expiredAt = null;

  constructor(private loginType: LoginType, private credentials: Credentials) {}

  get apiUrl() {
    return LoginTypes[this.loginType];
  }

  private async refreshAuth() {
    const authentication = await this.request(
      "/auth/refresh-user-token",
      "POST",
      {
        "refresh-token": this.authentication["refresh-token"]
      },
      false
    );

    this.authentication = authentication;
    return authentication["auth-token"];
  }

  private async createAuth() {
    const { email, password } = this.credentials;

    if (!email || !password) {
      throw new Error("Either your email, password or both are missing!");
    }

    const response = await this.request(
      "/auth/user-token",
      "POST",
      {
        email,
        password
      },
      false
    );

    this.expiredAt = Date.now() + AUTH_TOKEN_LIFETIME;
    this.authentication = response.data;
  }

  async authenticate() {
    if (
      this.authentication &&
      typeof this.authentication.token !== "undefined"
    ) {
      if (Date.now() >= this.expiredAt) {
        try {
          await this.refreshAuth();
          return this.authentication.token;
        } catch (e) {
          this.authentication = null;
          return this.authenticate();
        }
      }

      return this.authentication.token;
    }

    await this.createAuth();

    return this.authentication["auth-token"];
  }

  private async request(
    path: string,
    method: "GET" | "POST" | "PUT",
    data?: any,
    refreshAuth = true
  ) {
    if (refreshAuth) {
      await this.authenticate();
    }

    return axios(`${this.apiUrl}${path}`, {
      method,
      data: data && method !== "GET" ? data : undefined,
      headers: {
        ...(this.authentication
          ? { Authorization: `lemonpi ${this.authentication["auth-token"]}` }
          : {})
      }
    });
  }

  async get(path) {
    return this.request(path, "GET");
  }

  async post(path, data) {
    return this.request(path, "POST", data);
  }

  async put(path, data) {
    return this.request(path, "PUT", data);
  }
}
