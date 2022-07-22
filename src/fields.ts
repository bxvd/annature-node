import { AxiosInstance } from 'axios';
import { handleDataResponse, isoStringifyDates, snakeCase } from './utils';

export enum FieldType {
  Signature = 'signature',
  Initials = 'initials',
  Witness = 'witness',
  Date = 'date',
  Input = 'input',
  Checkbox = 'checkbox',
  Dropdown = 'dropdown',
}

export enum FieldFontType {
  Courier = 'courier',
  Helvetica = 'helvetica',
}

export type Field = {
  /**
   * The user-supplied identifier for the field. Fields can be retrieved using this property with the retrieve a field endpoint after an envelope has been created.
   *
   * This property must be unique to each field in an envelope.
   */
  id: string;
  /** The field type, possible values are `signature`, `initials`, `witness`, `date`, `input`, `checkbox`, and `dropdown`. */
  type: FieldType;
  /**
   * The page number in the envelope that the field should be placed on. When using more than one document in an envelope, assume page numbers as if documents are
   * merged together.
   * */
  page?: number;
  /**
   * The anchor string for the field.
   *
   * This property enables automatic placement and does not require a `page`, `xCoordinate` or `yCoordinate`.
   */
  anchor?: string;
  /** The pixel-based amount of x-axis offset to be used on matched anchor text strings. */
  xOffset?: number;
  /** The pixel-based amount of y-axis offset to be used on matched anchor text strings. */
  yOffset?: number;
  /**
   * The absolute pixel-based x coordinate for the field.
   *
   * This property enables fixed positioning for the field and requires a `yCoordinate` and `page` number.
   */
  xCoordinate?: number;
  /**
   * The absolute pixel-based y coordinate for the field.
   *
   * This property enables fixed positioning for the field and requires a `xCoordinate` and `page` number.
   */
  yCoordinate?: number;
  /**
   * Whether the field is required to be actioned by the recipient before the envelope can be completed.
   *
   * For input fields, this requires at least one character to be entered, for checkbox fields this requires the checkbox to be checked, and for dropdown fields this requires
   * one of the options to be selected.
   */
  required: boolean;
  /**
   * Whether or not the field should be treated as read-only to the recipient.
   *
   * This property can be used with the value property to print a static value on the document that the recipient should not be able to change.
   */
  readOnly: boolean;
  /**
   * Allows other recipients on the envelope to modify the field's value.
   *
   * Collaborative fields are live until the final recipient has completed the envelope, meaning the value is only printed on the document on envelope completion.
   */
  collaborative: boolean;
  /**
   * The field's value.
   *
   * This property can be used on envelope creation to set an input field's starting text or for dropdown fields to select the starting option. This value will be updated
   * on completion to reflect the recipient's selection.
   */
  value?: string;
  /**
   * For checkbox fields this represents the checked status.
   *
   * This property can be used on envelope creation to start a checkbox as checked or unchecked and will be updated on completion to reflect the recipient's selection.
   */
  checked: boolean;
  /**
   * The pixel-based height for the field.
   *
   * For input fields the height will determine the starting dimension of the input box, however will automatically increase according to the amount of text entered.
   */
  height?: number;
  /**
   * The pixel-based width for the field.
   *
   * For signature and witness fields it is recommended that widths be equal to 2.5x the height. For initial fields the width will automatically be determined by the height
   * assuming a 1:1 aspect ratio.
   */
  width?: number;
  /** The collection of options used to populate the html dropdown field. */
  options?: {
    /** The value for the option. This property will be saved on the field's value property on completion. */
    value: string;
    /** The user-facing option for the field. This is what will be printed on the document when selected. */
    option: string;
  }[];
  /**
   * The pixel-based font size for the field, only applicable when the `type` is `date`.
   *
   * Font size can range between 8 and 32 with the default being 12.
   */
  fontSize?: number;
  /**
   * The font type for the field, only applicable when the type is date.
   *
   * Possible values are courier and helvetica.
   */
  fontType?: FieldFontType;
  /** The date format to be used when printing dates on the document. */
  dateFormat: 'DD/MM/YYYY';
  /** Date and time at which the field was created. */
  created: Date;
};

export type Attachment = {
  id: string;
  original: string;
  name: string;
  type: string;
  size: number;
  created: Date;
};

export type FieldsListParams = {
  /** The unique identifier of the envelope that the fields belong to. */
  envelopeId: string;
};

export type FieldRetrieveParams = FieldsListParams;

export default (client: AxiosInstance) => ({
  /**
   * Returns a list of fields from an envelope. Returned fields are augmented to include a `recipientId` which can be used to map a field to the recipient it was created for.
   *
   * Fields that were supplied without an `id` property in the request body when creating an envelope will have had one automatically created.
   */
  list: (params: FieldsListParams) =>
    handleDataResponse<(Field & { recipientId: string })[]>(
      client.get('fields', { params: snakeCase(isoStringifyDates(params)) }),
    ),
  /**
   * Retrieves a single field created for an envelope using the `id` property that was supplied in the create an envelope endpoint.
   *
   * This endpoint can be used to retrieve the value of an `input` or `dropdown` type field after the envelope has been completed by a recipient.
   * @param id The unique identifier for the field.
   */
  retrieve: (id: string, params: FieldRetrieveParams) =>
    handleDataResponse<Field | undefined>(client.get(`fields/${id}`, { params: snakeCase(isoStringifyDates(params)) })),
  /**
   * Retrieves all attachments for a field using the `id` property that was supplied in the create an envelope endpoint.
   *
   * This endpoint can be used to retrieve all attachments that were uploaded by a recipient during the signing flow. This endpoint can only be
   * used when the field type is attachment.
   * @param id The unique identifier for the field.
   */
  retrieveAttachments: (id: string, params: FieldRetrieveParams) =>
    handleDataResponse<Attachment[]>(
      client.post(`fields/${id}/attachments`, { params: snakeCase(isoStringifyDates(params)) }),
    ),
});
