export const snakeCase = (o?: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {};

  if (o) {
    for (const key of Object.keys(o)) {
      newObj[key.replaceAll(/([A-Z])/g, match => '_' + match.toLowerCase())] = o[key];
    }
  }

  return newObj;
};

export const camelCase = (o?: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {};

  if (o) {
    for (const key of Object.keys(o)) {
      newObj[key.replaceAll(/(_[a-z])/g, match => match.slice(-1).toUpperCase())] = o[key];
    }
  }

  return newObj;
};
