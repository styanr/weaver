const SEPARATOR = ',';

export const serializeArray = (arr: readonly string[] | readonly number[]) => {
  return arr.join(SEPARATOR);
};

export const deserializeArray = (serialized: string | null) => {
  return serialized?.split(SEPARATOR) ?? [];
};
