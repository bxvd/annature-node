import { AxiosInstance } from 'axios';
import { handleDataResponse, isoStringifyDates, snakeCase } from './utils';

export type Organisation = {
  /** The unique identifier for the organisation. */
  id: string;
  /** The business name of the organisation. */
  name: string;
  /** The email address of the organisation. */
  email: string;
  /** The contact number of the organisation. */
  number: string;
  /** The street address of the organisation. */
  address: string;
  /** The website url of the organisation. */
  website: string;
  /** The annature-hosted website url of the organisation's branding logo. */
  logo: string;
  /** The hex colour code of the organisation's branding colour. */
  colour: string;
  /** Date and time at which the group was created. */
  created: Date;
};

export type OrganisationUpdateParams = Pick<Organisation, 'name'> &
  Omit<Partial<Organisation>, 'id' | 'logo' | 'colour' | 'created'> & {
    /**
     * Buffer or Base64 encoded string of the logo.
     *
     * The data should decode into an image with a mime type of `image/jpeg`, `image/png` or `image/gif` and the file size must not be greater than 5mb.
     */
    logo?: Buffer | string;
    /**
     * Hex colour code representing the organisation's branding colour.
     *
     * The hex colour code must be supplied as a 6 digit code prefixed by a `#`.
     */
    colour?: string;
  };

export default (client: AxiosInstance) => ({
  /** Retrieves the details of your organisation. */
  retrieve: () => handleDataResponse<Organisation>(client.get('organisations')),
  /** Creates a new group. */
  update: (params: OrganisationUpdateParams) =>
    handleDataResponse<Organisation>(
      client.put(
        'organisations',
        snakeCase(
          isoStringifyDates({
            ...params,
            logo: Buffer.isBuffer(params.logo) ? params.logo.toString('base64') : params.logo,
          }),
        ),
      ),
    ),
});
