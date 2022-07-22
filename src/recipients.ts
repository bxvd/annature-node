import { AxiosInstance } from 'axios';
import { handleDataResponse, isoStringifyDates, snakeCase } from './utils';

export enum RecipientType {
  Signer = 'signer',
  Viewer = 'viewer',
  CarbonCopy = 'carbon-copy',
}

export enum RecipientStatus {
  Created = 'created',
  Pending = 'pending',
  Send = 'sent',
  Failed = 'failed',
  Completed = 'completed',
  Declined = 'declined',
}

export type Recipient = {
  /** The unique identifier for the recipient. */
  id: string;
  /** The recipient's full name. */
  name: string;
  /** The recipient's email address, this will be used by default in all email correspondence to the recipient. */
  email: string;
  /** The recipient's mobile number, must be supplied adhering to E.164 format. */
  mobile?: string;
  /** The recipient type, defaults to `signer` when not supplied. Possible values are `signer`, `viewer`, and `carbon-copy`. */
  type: RecipientType;
  /**
   * Read-only string representing the recipient's status. Recipients with a type of `carbon-copy` will not have a status as they are only involved in the envelope
   * transaction once it has been completed.
   *
   * Possible values are `created`, `pending`, `sent`, `failed`, `completed`, and `declined`.
   */
  status?: RecipientStatus;
  /**
   * The recipient-specific envelope message. This property will take precedence over the envelope message when supplied, and can be used to show a unique message to each
   * recipient in an envelope.
   */
  message?: string;
  /** A password, code or passphrase that the recipient must enter before they are able to view the envelope. */
  password?: string;
  /** Whether or not Annature will skip all correspondence to the recipient. */
  muted: boolean;
  /** The recipient's signing order. The recipient will only be sent an envelope when all recipients with a lesser signing order have completed their actions. */
  order?: number;
  /** The reason entered by the recipient when declining the document. */
  declinedReason?: string;
  /** Date and time at which the recipient was created. */
  created: Date;
  /** Date and time at which the recipient was sent their first correspondence. This property will be null if the recipient is muted. */
  sent?: Date;
  /** Date and time at which the recipient declined the envelope. */
  declined?: Date;
  /** Date and time at which the recipient completed their actions. */
  completed?: Date;
  /**
   * Destination endpoints to redirect the recipient's web browser to after different actions have been taken while in-session.
   *
   * Endpoints can be supplied with `{{envelope_id}}` and `{{recipient_id}}` tokens which will automatically be updated with the corresponding attributes once the entities
   * have been created.
   */
  redirects?: {
    /** Destination endpoint after the recipient has completed the envelope. */
    sessionCompleted?: string;
    /** Destination endpoint after the recipient has declined to sign the envelope. */
    sessionDeclined?: string;
  };
};

export type RecipientToken = {
  endpoint: string;
  expiration: Date;
};

export type RecipientRetrieveTokenParams = {
  /** Sets the number of days that the endpoint will be accessible for. Number can range between 1 and 30 with the default being 7. */
  tokenDuration?: number;
};

export type RecipientUpdateParams = {
  /** The recipient's full name. */
  name: string;
  /** The recipient's email address. */
  email: string;
  /** The recipient's mobile number, must be supplied adhering to E.164 format. */
  mobile?: string;
};

export default (client: AxiosInstance) => ({
  /**
   * Retrieves a single recipient created for an envelope using the `id` property that was returned in the create an envelope response body.
   * @param id The unique identifier for the recipient.
   */
  retrieve: (id: string) => handleDataResponse<Recipient | undefined>(client.get(`recipients/${id}`)),
  /**
   * Generates a new signing token that can be used to access the envelope in the context of the recipient. If the recipient has already completed the envelope, this token can be
   * used to view and download the master copy.
   *
   * When a recipient attempts to access an envelope using an expired signing token, they may choose to request a new one from Annature. When the recipient is not muted, Annature
   * will send a new email or sms to the recipient based on the method they choose, however when the recipient is muted a `recipient_token_request` webhook event will be created.
   * @param id The unique identifier for the recipient.
   */
  retrieveToken: (id: string, params: RecipientRetrieveTokenParams) =>
    handleDataResponse<RecipientToken>(
      client.get(`recipients/${id}/token`, { params: snakeCase(isoStringifyDates(params)) }),
    ),
  /**
   * Sends a new signing email to the recipient. If the envelope has been completed, a new envelope completion email will be sent to the recipient instead.
   *
   * If you are resending a signing email to a recipient with a status of `failed` or `declined`, the status will automatically be updated back to `sent`.
   *
   * When the recipient's status is `completed` but the envelope is still in progress, this endpoint cannot be accessed as there is no action for the recipient to take.
   *
   * Recipients with type `carbon-copy` are only eligible to receive envelope completion emails, therefore for these recipients this endpoint can only be accessed when the
   * envelope status is `completed`.
   * @param id The unique identifier for the recipient.
   */
  resendEmail: (id: string) => handleDataResponse<Recipient>(client.post(`recipients/${id}/resend-email`)),
  /**
   * Sends a new signing sms to the recipient. This endpoint is only accessible when the recipient is in progress and the recipient has a mobile number.
   *
   * If you are resending a signing sms to a recipient with a status of `failed` or `declined`, the status will automatically be updated back to `sent`.
   *
   * Recipients with type `carbon-copy` are not eligible to receive sms notifications.
   * @param id The unique identifier for the recipient.
   */
  resendSms: (id: string) => handleDataResponse<Recipient>(client.post(`recipients/${id}/resend-sms`)),
  /**
   * Updates the recipient by setting the values of the supplied parameters.
   *
   * When the name of a recipient is being changed, a new recipient will be created with a new `id` property. The existing recipient will be removed from the envelope, and
   * any signing tokens that have been sent or sessions that have been created will immediately be expired.
   *
   * When the email address of a recipient is being changed, a new signing email will immediately be dispatched provided the recipient is eligible to receive signing emails.
   * The same rule applies when changing the recipient's mobile number.
   *
   * If you are updating a recipient with a status of `failed` or `declined`, the status will automatically be updated back to `sent`.
   * @param id The unique identifier for the recipient.
   */
  update: (id: string, params: RecipientUpdateParams) =>
    handleDataResponse<Recipient>(client.put(`recipients/${id}`, snakeCase(isoStringifyDates(params)))),
});
