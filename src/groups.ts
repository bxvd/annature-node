import { AxiosInstance } from 'axios';
import { handleDatalessResponse, handleDataResponse, isoStringifyDates, snakeCase } from './utils';

export type Group = {
  /** The unique identifier for the group. */
  id: string;
  /** The identifier for the group, this will be shown in the Annature dashboard. */
  name: string;
  /** The business name of the group, to be used in place of the organisation's business name. */
  business?: string;
  /** The email address of the group, to be used in place of the account's email address. */
  email?: string;
  /** The contact number of the group, to be used in place of the organisation's contact number. */
  number?: string;
  /** The street address of the group, to be used in place of the organisation's street address. */
  address?: string;
  /** The website url of the group, to be used in place of the organisation's website url. */
  website?: string;
  /** The annature-hosted website url of the group's branding logo. */
  logo?: string;
  /** The hex colour code of the group's branding colour. */
  colour?: string;
  /** Date and time at which the group was created. */
  created: Date;
};

export type GroupsListParams = {
  /** An exact-match filter on the list based on the group's `name` property. */
  name?: string;
  /** An exact-match filter on the list based on the group's `business` property. */
  business?: string;
  /** An exact-match filter on the list based on the group's `email` property. */
  email?: string;
};

export type GroupCreateParams = Omit<Group, 'id' | 'logo' | 'colour' | 'created'> & {
  /**
   * Buffer or Base64 encoded string of the logo.
   *
   * The data should decode into an image with a mime type of `image/jpeg`, `image/png` or `image/gif` and the file size must not be greater than 5mb.
   */
  logo?: Buffer | string;
  /**
   * Hex colour code representing the group's branding colour.
   *
   * The hex colour code must be supplied as a 6 digit code prefixed by a `#`.
   */
  colour?: string;
};

export default (client: AxiosInstance) => ({
  /**
   * Returns a list of groups. Groups are sorted by creation date, with the most recently created groups appearing first.
   *
   * Results are limited to 1000.
   */
  list: (params?: GroupsListParams) =>
    handleDataResponse<Group[]>(client.get('groups', { params: snakeCase(isoStringifyDates(params)) })),
  /**
   * Retrieves the details of an existing group.
   * @param id The unique identifier for the account.
   */
  retrieve: (id: string) => handleDataResponse<Group | undefined>(client.get(`groups/${id}`)),
  /** Creates a new group. */
  create: (params: GroupCreateParams) =>
    handleDataResponse<Group>(
      client.post(
        'groups',
        snakeCase(
          isoStringifyDates({
            ...params,
            logo: Buffer.isBuffer(params.logo) ? params.logo.toString('base64') : params.logo,
          }),
        ),
      ),
    ),
  /**
   * Permanently deletes a group.
   *
   * Any accounts and envelopes that were assigned to the group will be unassigned.
   * @param id The unique identifier for the account.
   */
  restore: (id: string) => handleDatalessResponse(client.delete(`groups/${id}`)),
});
