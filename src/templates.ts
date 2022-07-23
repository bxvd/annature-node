import { AxiosInstance } from 'axios';
import { Document } from './documents';
import { handleDataResponse, isoStringifyDates, snakeCase } from './utils';

export type Template = {
  /** The unique identifier for the envelope. */
  id: string;
  /** The name of the template. */
  name: string;
  /** Whether the template is shared with other accounts that belong to the same group as the creator. */
  shared: boolean;
  /** Defines the default name of envelopes created by using the template. */
  envelopeName: string;
  /** Defines the default message of envelopes created by using the template. */
  envelopeMessage?: string;
  /** Defines the default sharing behaviour of envelopes created by using the template. */
  envelopeShared: boolean;
  /** Date and time at which the template was created. */
  created: Date;
  /** The unique identifier of the account that created the template. This account is also referred to as the creator. */
  accountId: string;
  /**
   * The unique identifier of the group that the template has been assigned to.
   *
   * If the `shared` property is true, other accounts that also belong to this group will have access to use the template.
   */
  groupId: string;
  /** The documents of the template. */
  documents: Document[];
  /** The roles of the template. */
  roles: any[];
};

export type TemplatesListParams = {
  /** An exact-match filter on the list based on the template's `name` property. */
  name?: string;
  /** Returns results where the `created` date is before the given value. */
  createdBefore?: Date;
  /** Returns results where the `created` date is after the given value. */
  createdAfter?: Date;
};

export type TemplateUseParams = {
  /**
   * The name of the envelope, displayed in the subject of emails sent to recipients and when viewing the envelope. The envelope will automatically inherit the
   * `envelopeName` property of the template when it exists, and when this property has not been supplied.
   *
   * This property is only required when the template does not have a default envelope name.
   */
  name?: string;
  /**
   * The envelope message, displayed in the body of the emails sent to recipients and when viewing the envelope in Annature. The envelope will automatically inherit the
   * `envelopeMessage` property of the template when it exists, and when this property has not been supplied.
   */
  message?: string;
  /**
   * Whether or not the envelope should be shared with other accounts that belong to the same group as the envelope. The envelope will automatically inherit the
   * `envelopeShared` property of the template when it exists, and when this property has not been supplied.
   */
  shared?: boolean;
  /** Whether or not the envelope should be created as a draft. Drafts can be opened in in the Annature dashboard and finalised manually before being sent. */
  draft?: boolean;
  /** The unique identifier of the account that is creating the envelope. This account is also referred to as the sender. */
  accountId: string;
  /**
   * The unique identifier of the group to be used for the envelope. This property can be supplied to override the default behaviour of the envelope inheriting the same
   * group as the envelope's sender.
   *
   * If a group is not supplied, the envelope will automatically inherit the same group as the sender.
   */
  groupId?: string;
  /**
   * The collection of documents that make up the envelope. The envelope will automatically inherit the documents of the template when this property is not supplied.
   *
   * Documents can be supplied in order to replace a document of the template with another document.
   */
  documents?: {
    /** The id property of the document being replaced. */
    replacing: string;
    /**
     * The user-supplied identifier for the document. Documents can be retrieved using this property with the retrieve a document endpoint after an envelope has been created.
     *
     * This property must be unique to each document in an envelope.
     */
    id?: string;
    /**
     * The file name of the document, this will help recipients identify multiple files when viewing the envelope in Annature
     *
     * If a file name it not supplied, one will automatically be generated using a 32 character uuid.
     */
    name?: string;
    /** The Buffer or base64 encoded string of the PDF file. */
    base: Buffer | string;
  }[];
  /** The collection of recipients that make up the envelope. The number of recipients supplied in the request must match the number of roles that exist on the template. */
  recipients: {
    /**
     * The `id` property of the role the recipient is inheriting fields and other properties from.
     *
     * This property can be retrieved by using the list all templates endpoint.
     */
    roleId: string;
    /**
     * The recipient's full name. The recipient will automatically inherit the `recipientName` property of the role when it exists, and when this property is not supplied.
     *
     * This property is only required when the role does not have a default recipient name.
     */
    name?: string;
    /**
     * The recipient's email address. The recipient will automatically inherit the `recipientEmail` property of the role when it exists, and when this property is not supplied.
     *
     * This property is only required when the role does not have a default recipient name.
     */
    email?: string;
    /**
     * The recipient's mobile number, must be supplied adhering to E.164 format. The recipient will automatically inherit the `recipientMobile` property of the role when it
     * exists, and when this property is not supplied.
     */
    mobile?: string;
    /**
     * The recipient-specific envelope message. This property will take precedence over the envelope message when supplied, and can be used to show a unique message to each
     * recipient in an envelope.
     */
    message?: string;
    /**
     * A password, code or passphrase that the recipient must enter before they are able to view or complete an envelope they have been sent. The recipient will automatically
     * inherit the `recipientPassword` property of the role when it exists, and when this property is not supplied.
     */
    password?: string;
    /** Whether or not Annature will skip all correspondence to the recipient. */
    muted?: boolean;
    /**
     * Destination endpoints to redirect the recipient's web browser to after different actions have been taken while in-session.
     *
     * Endpoints can be supplied with and tokens which will automatically be updated with the corresponding attributes once the entities have been created.
     */
    redirects?: {
      /**
       * Destination endpoint after the recipient has completed the envelope. The recipient will automatically inherit the `sessionCompleted` property of the role when it exists,
       * and when this property has not been supplied.
       */
      sessionCompleted?: string;
      /**
       * Destination endpoint after the recipient has declined to sign the envelope. The recipient will automatically inherit the `sessionDeclined` property of the role when it
       * exists, and when this property has not been supplied.
       */
      sessionDeclined?: string;
    };
  }[];
};

export default (client: AxiosInstance) => ({
  /**
   * Returns a list of usable templates. Templates are sorted by creation date, with the most recent templates appearing first. Templates that do not contain any documents
   * or roles are not considered usable and will not be returned.
   *
   * Results are limited to 250.
   */
  list: (params?: TemplatesListParams) =>
    handleDataResponse<Template[]>(client.get('templates', { params: snakeCase(isoStringifyDates(params)) })),
  /**
   * Creates an envelope automatically inheriting most required fields from the template.
   *
   * The number of recipients supplied in the request must match the number of roles that exist on the template. For example, if a template contains three roles you must supply
   * three recipients each with a `roleId` property that corresponds to the template role the recipient is inheriting fields or other properties from.
   *
   * Documents are not required to be supplied as the documents of the template will automatically be used to create the envelope. If a document of the template is being
   * replaced with another document, you must ensure the new document contains the same number of pages as the one being replaced.
   *
   * Draft envelopes can be created by supplying `draft` as true. Drafts can be opened in the Annature dashboard and fields can be added manually before being sent by opening
   * the following URL: `https://dashboard.annature.com.au/create-envelope?envelopeId={{envelope_id}}`.
   * @param id The unique identifier of the template being used to create the envelope.
   */
  use: (id: string, params: TemplateUseParams) =>
    handleDataResponse<Template | undefined>(
      client.post(`templates/${id}/use`, {
        params: snakeCase(
          isoStringifyDates({
            id,
            ...params,
            documents: params.documents
              ? params.documents.map(v => ({
                  ...v,
                  base: Buffer.isBuffer(v.base) ? v.base.toString('base64') : v.base,
                }))
              : params.documents,
          }),
        ),
      }),
    ),
});
