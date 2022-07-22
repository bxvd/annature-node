import axios, { AxiosInstance } from 'axios';
import accounts from './accounts';
import documents from './documents';
import endpoints from './endpoints';
import envelopes from './envelopes';

export type Credentials = {
  id: string;
  key: string;
};

export class Annature {
  private readonly _id: string;
  private readonly _key: string;
  private readonly client: AxiosInstance;
  readonly accounts: ReturnType<typeof accounts>;
  readonly documents: ReturnType<typeof documents>;
  readonly endpoints: ReturnType<typeof endpoints>;
  readonly envelopes: ReturnType<typeof envelopes>;

  constructor(credentials: Credentials) {
    this._id = credentials.id;
    this._key = credentials.key;

    this.client = axios.create({
      baseURL: 'https://api.annature.com.au/v1/',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Annature-Id': credentials.id,
        'X-Annature-Key': credentials.key,
      },
    });

    this.accounts = accounts(this.client);
    this.documents = documents(this.client);
    this.endpoints = endpoints(this.client);
    this.envelopes = envelopes(this.client);
  }
}
