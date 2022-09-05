export const truncate = (str = '', len = 250) => {
  return str.length > len ? `${str.substring(0, len)}...` : str;
};
