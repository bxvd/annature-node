import { AxiosInstance } from 'axios';
import { Field } from './fields';
import { Recipient } from './recipients';
import { handleDatalessResponse, handleDataResponse, isoStringifyDates, snakeCase } from './utils';

export enum EnvelopeStatus {
  Draft = 'draft',
  Created = 'created',
  Sent = 'sent',
  Completed = 'completed',
  Voided = 'voided',
}

export type Envelope = {
  /** The unique identifier for the envelope. */
  id: string;
  /** The name of the envelope, displayed in the subject of emails sent to recipients and when viewing the envelope. */
  name: string;
  /** The envelope message, displayed in the body of the emails sent to recipients and when viewing the envelope in Annature. */
  message?: string;
  /** Read-only string representing the envelope's status. Possible values are `draft`, `created`, `sent`, `completed`, and `voided`. */
  status: EnvelopeStatus;
  /** Whether the envelope is shared with other accounts that belong to same group as the sender. */
  shared: boolean;
  /** Date and time at which the envelope was created. */
  created: Date;
  /** Date and time at which the envelope was sent to recipients. */
  sent?: Date;
  /** Date and time at which the envelope was voided by the sender. */
  voided?: Date;
  /** Date and time at which the envelope was declined by one of the recipients. */
  declined?: Date;
  /** Date and time at which the envelope was completed by all recipients. */
  completed?: Date;
  /** A temporary endpoint which can be used to download the original copy of the envelope.
   *
   * By default endpoints are accessible for 60 minutes, after which they will return 403 forbidden.
   */
  original?: string;
  /**
   * A temporary endpoint which can be used to download the master copy of the envelope. This property will be null if the envelope status is `created`.
   *
   * By default endpoints are accessible for 60 minutes, after which they will return 403 forbidden.
   */
  master?: string;
  /**
   * A temporary endpoint which can be used to download the envelope's certificate of completion. This property will only be populated when the envelope status is `completed`.
   *
   * By default endpoints are accessible for 60 minutes, after which they will return 403 forbidden.
   */
  certificate?: string;
  /** The unique identifier of the account that created the envelope. This account is also referred to as the sender. */
  accountId: string;
  /**
   * The unique identifier of the group that the envelope has been assigned to.
   *
   * If the `shared` property is true, other accounts that also belong to this group will have access to view and manage the envelope.
   */
  groupId: string;
  /** The recipients of the envelope, there must be at least one recipient with a `type` of `signer`. */
  recipients: Recipient[];
  /** Set of key-value pairs you can attach to an envelope. This can be used to store additional information about the envelope in a structured format. */
  metadata: { [key: string]: string | number | null | undefined };
};

export type EnvelopesListParams = {
  /** An exact-match filter on the list based on the envelope's `name` property. */
  name?: string;
  /** An exact-match filter on the list based on the envelope's `status` property. */
  status?: EnvelopeStatus;
  /**
   * An exact-match filter on the list based on any recipient's `name` or `email` property.
   *
   * By searching for envelopes based on a recipient's name or email, all recipients of that envelope will still be returned in the response.
   */
  recipient?: string;
  /** Returns results where the `created` date is before the given value. */
  createdBefore?: Date;
  /** Returns results where the `created` date is after the given value. */
  createdAfter?: Date;
  /** Returns results where the `completed` date is before the given value. */
  completedBefore?: Date;
  /** Returns results where the `completed` date is after the given value. */
  completedAfter?: Date;
};

export type EnvelopeRetrieveParams = {
  /** Sets the number of minutes that the `master` and `certificate` endpoints will be accessible for. Number can range between 1 and 10080 with the default being 60. */
  endpointDuration?: number;
};

export type EnvelopeCreateParams = {
  /** The name of the envelope, displayed in the subject of emails sent to recipients and when viewing the envelope. */
  name: string;
  /** The envelope message, displayed in the body of the emails sent to recipients and when viewing the envelope in Annature. */
  message?: string;
  /** Whether or not the envelope should be shared with other accounts that belong to the same group as the envelope. */
  shared?: boolean;
  /**
   * Whether or not the envelope should be created as a draft. Drafts can be opened in in the Annature dashboard and finalised manually before being sent.
   *
   * If draft is not supplied, the envelope will be created and signing emails sent to all eligible recipients.
   */
  draft?: boolean;
  /** The unique identifier of the account that is creating the envelope. This account is also referred to as the sender. */
  accountId: string;
  /**
   * The unique identifier of the group to be used for the envelope. This property can be supplied to override the default behaviour of the envelope inheriting the
   * same group as the envelope's sender.
   *
   * If a group is not supplied, the envelope will automatically inherit the same group as the sender.
   */
  groupId?: string;
  /**
   * The collection of documents that make up the envelope.
   *
   * Documents must be supplied as a base64 encoded string and decode to a file with mime type of `application/pdf`. The maximum file size for a document must not
   * be greater than 10mb.
   */
  documents: {
    /**
     * The user-supplied identifier for the document. Documents can be retrieved using this property with the retrieve a document endpoint after an envelope has been created.
     *
     * This property must be unique to each document in an envelope.
     */
    id?: string;
    /**
     * The file name of the document, this will help recipients identify multiple files when viewing the envelope in Annature.
     *
     * If a file name is not supplied, one will automatically be generated using a 32 character uuid.
     */
    name?: string;
    /** The Buffer or the base64 encoded string of the PDF file. */
    base: string;
  }[];
  /**
   * The collection of recipients that make up the envelope. There must be at least one recipient with a type of `signer`.
   *
   * Recipients are only required when an envelope is not being created as a draft.
   */
  recipients?: (Omit<
    Recipient,
    'id' | 'type' | 'muted' | 'declinedReason' | 'created' | 'sent' | 'declined' | 'completed'
  > & {
    /**
     * The collection of fields for the recipient. Fields can only be supplied when the recipient type is `signer`.
     *
     * Fields are not supported when creating a draft envelope.
     */
    fields?: (Omit<Field, 'id' | 'required' | 'readOnly' | 'collaborative' | 'checked' | 'dateFormat'> &
      Pick<Partial<Field>, 'id' | 'required' | 'readOnly' | 'collaborative' | 'checked' | 'dateFormat'>)[];
  })[];
  /** Set of key-value pairs you can attach to an envelope. This can be used to store additional information about the envelope in a structured format. */
  metadata?: { [key: string]: string | number | null | undefined };
};

export default (client: AxiosInstance) => ({
  /**
   * Returns a list of envelopes. Envelopes are sorted by creation date, with the most recent envelopes appearing first.
   *
   * When no status parameter has been supplied, draft envelopes will not be returned.
   *
   * Results are limited to 1000.
   */
  list: (params?: EnvelopesListParams) =>
    handleDataResponse<Envelope[]>(client.get('envelopes', { params: snakeCase(isoStringifyDates(params)) })),
  /**
   * Retrieves the details of an existing envelope.
   *
   * The recipients list will be returned in the same order in which they were supplied in the body of the create an envelope request.
   * @param id The unique identifier for the account.
   */
  retrieve: (id: string, params?: EnvelopeRetrieveParams) =>
    handleDataResponse<Envelope | undefined>(
      client.get(`envelopes/${id}`, { params: snakeCase(isoStringifyDates(params)) }),
    ),
  /**
   * Creates an envelope and by default, sends a signing email to all eligible recipients adhering to the recipient `order` and `muted` properties. For more information about these
   * properties and how they determine when and if signing emails are sent, refer to the recipients section.
   *
   * Envelopes must be created with an `accountId` in order to identify the sender of the envelope. If the account belongs to a group, the envelope will automatically inherit the
   * same group as the sender.
   *
   * Envelopes must contain at least one document and one recipient with a type of `signer`. Recipients with a type of `signer` must also contain at least one field.
   *
   * Draft envelopes can be created by supplying `draft` as true and at least one document. A draft can be created with or without recipients, though recipient fields are not
   * supported.
   *
   * Drafts can be opened in the Annature dashboard and fields can be added manually before being sent by opening the following URL:
   * `https://dashboard.annature.com.au/create-envelope?envelopeId={{envelope_id}}`.
   */
  create: (params: EnvelopeCreateParams) =>
    handleDataResponse<Envelope>(client.post('envelopes', snakeCase(isoStringifyDates(params)))),
  /**
   * Sends an existing draft envelope to all eligible recipients.
   *
   * This action can only be done when an envelope's status is `draft`.
   * @param id The unique identifier for the envelope.
   */
  send: (id: string) => handleDatalessResponse(client.post(`envelopes/${id}/send`)),
  /**
   * Voids an envelope cancelling all outstanding signature requests and preventing the envelope from being completed.
   *
   * This action can only be done when an envelope's status is `sent`. When a recipient attempts to open an envelope that has been voided, they will be prompted with an error
   * message notifying them that the envelope has been voided by the sender.
   * @param id The unique identifier for the envelope.
   */
  void: (id: string) => handleDatalessResponse(client.post(`envelopes/${id}/void`)),
  /**
   * Deletes an existing draft envelope.
   *
   * This action can only be done when an envelope's status is `draft`.
   * @param id The unique identifier for the envelope.
   */
  delete: (id: string) => handleDatalessResponse(client.delete(`envelopes/${id}`)),
});
