import axios from "axios";
import { Credentials } from "../types/index.d";

export default class ODC {
  private authentication = null;

  static API_URL = "https://api.lemonpi.io";

  static MANAGE_API_URL = "https://manage.lemonpi.io/api/v0";

  private async request(
    url: string,
    method: "GET" | "POST" | "PUT",
    data?: any
  ) {
    return axios(url, {
      method,
      data: data && method !== "GET" ? data : undefined,
      headers: {
        ...(this.authentication
          ? { Authorization: `lemonpi ${this.authentication.token}` }
          : {}),
        Host: "api.lemonpi.io",
        Origin: "https://manage.lemonpi.io"
      }
    });
  }

  async authenticate(credentials: Credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error("Either your email, password or both are missing!");
    }

    const response = await this.request(
      `${ODC.API_URL}/auth/user-token`,
      "POST",
      {
        email,
        password
      }
    );

    this.authentication = response.data;

    return this;
  }
}
