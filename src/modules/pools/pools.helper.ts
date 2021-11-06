import Decimal from 'decimal.js';

export const convertToContractAmount = (num: number, decimals: number) =>
  Math.round(new Decimal(num).mul(new Decimal(10).pow(decimals)).toNumber());
