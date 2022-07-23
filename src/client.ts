import axios, { AxiosInstance } from 'axios';
import accounts from './accounts';
import documents from './documents';
import endpoints from './endpoints';
import envelopes from './envelopes';
import fields from './fields';
import groups from './groups';
import organisations from './organisations';
import recipients from './recipients';

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
  readonly fields: ReturnType<typeof fields>;
  readonly groups: ReturnType<typeof groups>;
  readonly recipients: ReturnType<typeof recipients>;
  readonly organisations: ReturnType<typeof organisations>;

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
    this.fields = fields(this.client);
    this.groups = groups(this.client);
    this.recipients = recipients(this.client);
    this.organisations = organisations(this.client);
  }
}
