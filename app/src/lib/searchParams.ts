const SEPARATOR = ',';

export const serializeArray = (arr: readonly string[]) => {
  return arr.join(SEPARATOR);
};

export const deserializeArray = (serialized: string | null) => {
  return serialized?.split(SEPARATOR) ?? [];
};
