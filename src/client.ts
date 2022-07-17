import axios, { AxiosInstance } from 'axios';
import { camelCase, snakeCase } from './helpers';

export type Credentials = {
  publicKey: string;
  privateKey: string;
};

export enum Role {
  Administrator = 'administrator',
  Standard = 'standard',
  ReadOnly = 'read-only',
}

export type Account = {
  id: string;
  name: string;
  email: string;
  number: string;
  timezone: string;
  role: Role;
  created: Date;
  verified: Date;
  groupId: string;
};

export type AccountParams = {
  name?: string;
  email?: string;
  role?: Role;
  active?: boolean;
  groupId?: string;
  createdBefore?: Date | string;
  createdAfter?: Date | string;
};

export class Annature {
  private readonly _publicKey: string;
  private readonly _privateKey: string;
  private readonly client: AxiosInstance;

  constructor(credentials: Credentials) {
    this._publicKey = credentials.publicKey;
    this._privateKey = credentials.privateKey;

    this.client = axios.create({
      baseURL: 'https://api.annature.com.au/v1/',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Annature-Id': credentials.publicKey,
        'X-Annature-Key': credentials.privateKey,
      },
    });
  }

  readonly accounts = {
    list: async (params?: AccountParams) => {
      const res = await this.client.get('accounts', { params: snakeCase(params) });

      if (res.status !== 200) {
        throw Error(res.data);
      }

      return camelCase(res.data) as Account[];
    },
    retrieve: async (id: string) => {
      const res = await this.client.get(`accounts/${id}`);

      if (res.status !== 200) {
        throw Error(res.data);
      }

      return camelCase(res.data) as Account;
    },
  };
}
