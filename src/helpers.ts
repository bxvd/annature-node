import { AxiosResponse } from 'axios';

export const snakeCase = (o?: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {};

  if (o) {
    for (const key of Object.keys(o)) {
      newObj[key.replaceAll(/([A-Z])/g, match => '_' + match.toLowerCase())] = o[key];
    }
  }

  return newObj;
};

export const camelCase: <T>(o: any) => T = <T>(o?: { [key: string]: any }) => {
  const newObj: typeof o = {};

  if (o) {
    for (const key of Object.keys(o)) {
      newObj[key.replaceAll(/(_[a-z])/g, match => match.slice(-1).toUpperCase())] = o[key];
    }
  }

  return newObj as T;
};

export const isoStringifyDates = (o?: { [key: string]: any }) => {
  let newObj: typeof o = {};

  if (o) {
    newObj = { ...o };

    for (const key of Object.keys(o)) {
      if (o[key] instanceof Date) {
        newObj[key] = o[key].toISOString();
      }
    }
  }

  return newObj ?? {};
};

export const datifyIsoStrings = (o?: { [key: string]: any }) => {
  let newObj: typeof o = {};

  if (o) {
    newObj = { ...o };

    for (const key of Object.keys(o)) {
      if (['created', 'verified', 'sent', 'voided', 'declined', 'completed', 'viewed', 'failed'].includes(key)) {
        newObj[key] = new Date(o[key]);
      }
    }
  }

  return newObj ?? {};
};

export const handleDataResponse: <T>(apiCall: Promise<AxiosResponse>) => Promise<T> = async apiCall => {
  try {
    const res = await apiCall;

    return Array.isArray(res.data) ? res.data.map(v => datifyIsoStrings(v)) : (datifyIsoStrings(res.data) as any);
  } catch (error: any) {
    throw error?.response?.data?.message ? Error(error?.response?.data?.message) : error;
  }
};

export const handleDatalessResponse: (apiCall: Promise<AxiosResponse>) => Promise<void> = async apiCall => {
  try {
    await apiCall;
  } catch (error: any) {
    throw error?.response?.data?.message ? Error(error?.response?.data?.message) : error;
  }
};
