import { AxiosInstance } from 'axios';
import { handleDataResponse, snakeCase } from './utils';

export type Endpoint = {
  /** The unique identifier for the webhook endpoint. */
  id: string;
  /** The HTTPS URL of the webhook endpoint. */
  url: string;
  /** The endpoint's webhook signature, which can be used to verify webhooks. */
  signature: string;
  /** The status of the webhook endpoint. */
  active: boolean;
  /** Date and time at which the webhook endpoint was created. */
  created: Date;
};

export type EndpointCreateParams = {
  /** The HTTPS URL for the webhook endpoint. */
  url: string;
};

export type EndpointUpdateParams = {
  /** The status of the webhook endpoint. */
  active: boolean;
};

export default (client: AxiosInstance) => ({
  /** Returns a list of webhook endpoints. Endpoints are sorted by creation date, with the most recently created endpoints appearing first. */
  list: () => handleDataResponse<Endpoint[]>(client.get('endpoints')),
  /**
   * Retrieves the details of an existing webhook endpoint.
   * @param id The unique identifier for the webhook endpoint.
   */
  retrieve: (id: string) => handleDataResponse<Endpoint | undefined>(client.get(`endpoints/${id}`)),
  /**
   * Creates a new webhook endpoint with an HTTPS URL.
   *
   * The webhook endpoint signature is returned on creation, which can be used to verify webhooks.
   */
  create: (params: EndpointCreateParams) => handleDataResponse<Endpoint>(client.post('endpoints', snakeCase(params))),
  /**
   * Updates the webhook endpoint by setting the values of the supplied parameters.
   *
   * Currently only the active property is supported, meaning this endpoint can be used to temporarily deactivate and reactivate a webhook endpoint.
   *
   * The url property cannot be changed once the webhook endpoint has been created, you will need to create a new endpoint if this is required.
   * @param id The unique identifier for the webhook endpoint.
   */
  update: (id: string, params: EndpointUpdateParams) =>
    handleDataResponse<Endpoint>(client.put(`endpoints/${id}`, snakeCase(params))),
  /**
   * Permanently deletes a webhook endpoint.
   * @param id The unique identifier for the webhook endpoint.
   */
  delete: (id: string) => handleDataResponse<Endpoint>(client.delete(`endpoints/${id}`)),
});
