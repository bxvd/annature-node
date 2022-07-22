import axios, { AxiosInstance } from 'axios';
import { handleDatalessResponse, handleDataResponse, isoStringifyDates, snakeCase } from './helpers';

export type Credentials = {
  id: string;
  key: string;
};

export enum Role {
  Administrator = 'administrator',
  Standard = 'standard',
  ReadOnly = 'read-only',
}

export type Account = {
  id: string;
  /** The account holder's full name. */
  name: string;
  /** The account holder's email address. */
  email: string;
  /** The account holder's contact number. */
  number: string;
  /**
   * The timezone used in the Annature dashboard and for any envelopes sent by this account.
   * The envelope certificate and any date fields will have their true times determined by this timezone.
   *
   * Timezone must be supplied as a 6-digit UTC offset, for example Australia/Brisbane would be +10:00 and Australia/Perth would be +08:00.
   */
  timezone: string;
  /** The account role, possible values are `administrator`, `standard`, and `read-only`. By default all accounts are created as `standard` unless otherwise specified. */
  role: Role;
  /** Date and time at which the account was created. */
  created: Date;
  /** Date and time at which the account was verified. */
  verified: Date;
  /** The unique identifier of the group the account has been assigned to. */
  groupId: string;
};

export type AccountsListParams = {
  /** An exact-match filter on the list based on the account's `name` property. */
  name?: string;
  /** An exact-match filter on the list based on the account's `email` property. */
  email?: string;
  /** An exact-match filter on the list based on the account's `role` property. */
  role?: Role;
  /** An exact-match filter on the list based on the account's `active` property. */
  active?: boolean;
  /** An exact-match filter on the list based on the account's `groupId` property. */
  groupId?: string;
  /** Returns results where the `created` date is before the given value. */
  createdBefore?: Date | string;
  /** Returns results where the `created` date is after the given value. */
  createdAfter?: Date | string;
};

export type AccountCreateParams = Pick<Account, 'name' | 'email'> &
  Pick<Partial<Account>, 'number' | 'timezone' | 'role' | 'groupId'>;

export type AccountRegisterParams = Pick<Account, 'name' | 'email'> &
  Pick<Partial<Account>, 'number' | 'timezone'> & {
    /** The account holder's business name. */
    business: string;
    /**
     * The account holder's password. When a password has not been supplied, the account holder will be prompted to set one when actioning the verification email.
     *
     * If you are automating account verification, it is strongly recommended that you capture a password from the account holder prior to making the request and
     * supply it in the request body.
     */
    password?: string;
    /** For selected partners, automates the account verification process and does not send a verification email. */
    skipVerification?: boolean;
  };

export type Document = {
  /**
   * The user-supplied identifier for the document.
   *
   * This property is an optional parameter that can be supplied when creating an envelope.
   */
  id: string;
  /** The document's file name. This property is important to appropriately name files when downloaded from Annature. */
  name: string;
  /** The number of pages the document contains. */
  pages: number;
  /**
   * A temporary endpoint which can be used to download the original copy of the document.
   *
   * By default endpoints are accessible for 60 minutes, after which they will return 403 forbidden.
   */
  original: string;
  /**
   * A temporary endpoint which can be used to download the master copy of the document. This property will be null if the associated envelope's status is `created`.
   *
   * By default endpoints are accessible for 60 minutes, after which they will return 403 forbidden.
   */
  master?: string;
  /** The date and time at which the document was created. */
  created: Date;
};

export type DocumentsListParams = {
  /** The unique identifier of the envelope that the document belongs to. */
  envelopeId: string;
  /** Sets the number of minutes that the `original` and `master` endpoints will be accessible for. Number can range between 1 and 10080 with the default being 60. */
  endpointDuration?: number;
};

export type DocumentRetrieveParams = DocumentsListParams;

export class Annature {
  private readonly _id: string;
  private readonly _key: string;
  private readonly client: AxiosInstance;

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
  }

  readonly accounts = {
    /** Returns a list of accounts. Accounts are sorted by creation date, with the most recently created accounts appearing first. */
    list: (params?: AccountsListParams) =>
      handleDataResponse<Account[]>(this.client.get('accounts', { params: snakeCase(isoStringifyDates(params)) })),
    /**
     * Retrieves the details of an existing account.
     * @param id The unique identifier for the account.
     */
    retrieve: (id: string) => handleDataResponse<Account | undefined>(this.client.get(`accounts/${id}`)),
    /**
     * Creates a new account that can be used to send envelopes and log in to the Annature dashboard to create, send, and manage envelopes.
     *
     * New accounts will automatically be sent a verification email from Annature with a prompt to set a password.
     */
    create: (params: AccountCreateParams) =>
      handleDataResponse<Account>(this.client.post('accounts', snakeCase(params))),
    /**
     * Creates a new independent account and organisation that can be used to send envelopes and log in to the Annature dashboard.
     *
     * By default, all new accounts will be sent a verification email from Annature with a prompt to set a password.
     * Account verification can be automated by supplying true for the skip_verification property and a password can be set by supplying one in the request body.
     *
     * Accounts created using this endpoint will also return a pair of long-lived API keys so you can immediately start sending envelopes on behalf of the new account.
     */
    register: (params: AccountRegisterParams) =>
      handleDataResponse<Account & { credentials: Credentials }>(
        this.client.post('accounts/register', snakeCase(params)),
      ),
    /**
     * Resends a new verification email to the account holder's email address. Any existing verification emails will be voided and will show a friendly error message if clicked,
     * prompting to check for the most recent email.
     *
     * New verification emails can only be sent when an account's verified property is null.
     * @param id The unique identifier for the account.
     */
    resendVerification: (id: string) => handleDatalessResponse(this.client.post(`/v1/accounts/${id}/verification`)),
    /**
     * Deactivates an account preventing them from being able to send envelopes and log in to the Annature dashboard.
     *
     * When an account is deactivated all application sessions will immediately be expired.
     * @param id The unique identifier for the account.
     */
    deactivate: (id: string) => handleDatalessResponse(this.client.post(`/v1/accounts/${id}/deactivate`)),
    /**
     * Restores a deactivated account.
     * @param id The unique identifier for the account.
     */
    restore: (id: string) => handleDatalessResponse(this.client.post(`/v1/accounts/${id}/restore`)),
  };

  readonly documents = {
    /** Returns a list of documents created for an envelope. */
    list: (params: DocumentsListParams) =>
      handleDataResponse<Document[]>(this.client.get('documents', { params: snakeCase(isoStringifyDates(params)) })),
    /**
     * Retrieves a single document created for an envelope using the id property that was supplied in the create an envelope endpoint.
     *
     * This endpoint can be used to download the un-merged copy of a single document.
     */
    retrieve: (id: string, params: DocumentRetrieveParams) =>
      handleDataResponse<Document | undefined>(
        this.client.get(`documents/${id}`, { params: snakeCase(isoStringifyDates(params)) }),
      ),
  };
}
