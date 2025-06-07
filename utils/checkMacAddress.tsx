export const isValidMacAddress = (macAddress: string) => {
  const macRegex =
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
  return macRegex.test(macAddress);
};
