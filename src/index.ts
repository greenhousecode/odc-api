import axios from "axios";
import { Credentials } from "../types/index.d";

export default class ODC {
  private authentication = null;

  static API_URL = "https://api.lemonpi.io";

  static MANAGE_API_URL = "https://manage.lemonpi.io/api/v0";

  constructor(credentials: Credentials) {
    this.authenticate(credentials);
  }

  private async request(
    url: string,
    method: "GET" | "POST" | "PUT",
    data?: string | FormData
  ) {
    const headers = new Headers();

    if (this.authentication) {
      headers.set("Authorization", `lemonpi ${this.authentication.token}`);
    }

    headers.set("Host", "api.lemonpi.io");
    headers.set("Origin", "https://manage.lemonpi.io");

    const resp = await axios(url, {
      method,
      data: data && method !== "GET" ? data : undefined,
      headers
    });

    if (!/^20/.test(resp.status.toString()))
      throw new Error(`Request failed, ${resp.statusText}`);

    const contentType = resp.headers.get("content-type");

    if (!contentType || contentType.indexOf("application/json") === -1) return;

    // eslint-disable-next-line consistent-return
    return resp;
  }

  private async authenticate(credentials: Credentials) {
    const formData = new FormData();
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    const response = await this.request(
      `${ODC.API_URL}/auth/user-token`,
      "POST",
      formData
    );

    this.authentication = response;
  }
}
