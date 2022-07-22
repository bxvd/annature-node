import { AxiosInstance } from 'axios';
import { handleDataResponse, isoStringifyDates, snakeCase } from './utils';

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

export default (client: AxiosInstance) => ({
  /** Returns a list of documents created for an envelope. */
  list: (params: DocumentsListParams) =>
    handleDataResponse<Document[]>(client.get('documents', { params: snakeCase(isoStringifyDates(params)) })),
  /**
   * Retrieves a single document created for an envelope using the id property that was supplied in the create an envelope endpoint.
   *
   * This endpoint can be used to download the un-merged copy of a single document.
   */
  retrieve: (id: string, params: DocumentRetrieveParams) =>
    handleDataResponse<Document | undefined>(
      client.get(`documents/${id}`, { params: snakeCase(isoStringifyDates(params)) }),
    ),
});
