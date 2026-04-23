export const maskPhone = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value.substring(0, 15);
};

export const validatePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
};
