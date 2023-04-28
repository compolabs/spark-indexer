export const tai64toUnix = (tai64: string): number =>
  +(BigInt(tai64) - BigInt(Math.pow(2, 62)) - BigInt(10)).toString();
