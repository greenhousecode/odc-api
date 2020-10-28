import axios from 'axios';
import FormData from 'form-data';

interface Credentials {
  email: string;
  password: string;
}

export enum ApiType {
  LEGACY,
  NORMAL,
}

const ApiTypes = {
  [ApiType.LEGACY]: 'https://manage.lemonpi.io/api/v0',
  [ApiType.NORMAL]: 'https://api.lemonpi.io',
};

export const AUTH_TOKEN_LIFETIME = 60 * 15 * 1000; // 15 minutes

export default class ODCAuthClient implements AuthClient {
  private authentication = null;

  private expiredAt = null;

  constructor(private credentials: Credentials) {}

  private async refreshAuth() {
    const authentication = await this.request(
      ApiType.NORMAL,
      '/auth/refresh-user-token',
      'POST',
      {
        'refresh-token': this.authentication['refresh-token'],
      },
      false
    );

    this.authentication = authentication;
    return authentication['auth-token'];
  }

  private async createAuth() {
    const { email, password } = this.credentials;

    if (!email || !password) {
      throw new Error('Either your email, password or both are missing!');
    }

    const response = await this.request(
      ApiType.NORMAL,
      '/auth/user-token',
      'POST',
      {
        email,
        password,
      },
      false
    );

    this.expiredAt = Date.now() + AUTH_TOKEN_LIFETIME;
    this.authentication = response.data;
  }

  async authenticate() {
    if (
      this.authentication &&
      typeof this.authentication['auth-token'] !== 'undefined'
    ) {
      if (Date.now() >= this.expiredAt) {
        try {
          await this.refreshAuth();
          return this.authentication['auth-token'];
        } catch (e) {
          this.authentication = null;
          return this.authenticate();
        }
      }

      return this.authentication['auth-token'];
    }

    await this.createAuth();

    return this.authentication['auth-token'];
  }

  private async request(
    apiType: ApiType,
    path: string,
    method: 'GET' | 'POST' | 'PUT',
    data?: FormData | any,
    refreshAuth = true
  ) {
    if (refreshAuth) await this.authenticate();

    return axios({
      url: `${ApiTypes[apiType]}${path}`,
      method,
      data: data && method !== 'GET' ? data : undefined,
      headers: {
        ...(this.authentication
          ? { Authorization: `lemonpi ${this.authentication['auth-token']}` }
          : {}),
        ...(data instanceof FormData ? { ...data.getHeaders() } : {}),
      },
    });
  }

  async get(apiType: ApiType, path: string) {
    return this.request(apiType, path, 'GET');
  }

  async post(apiType: ApiType, path: string, data) {
    return this.request(apiType, path, 'POST', data);
  }

  async put(apiType: ApiType, path: string, data) {
    return this.request(apiType, path, 'PUT', data);
  }
}
