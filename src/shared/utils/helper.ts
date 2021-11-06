import {
  Account,
  Connection,
  Keypair,
  sendAndConfirmTransaction as realSendAndConfirmTransaction,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import * as mongoose from 'mongoose';

export const isEmpty = (str?: string | null): boolean => {
  if (!str) {
    return true;
  }
  return str.trim() === '';
};

export const stringToUnit8Array = (str: string) => {
  return Buffer.from(str, 'base64');
};

export const unit8ArrayToString = (arr: Uint8Array) => {
  return Buffer.from(arr).toString('base64');
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidId(id: string): boolean {
  if (mongoose.Types.ObjectId.isValid(id)) {
    if (new mongoose.Types.ObjectId(id).toHexString() === id) {
      return true;
    }

    return false;
  }
  return false;
}

export function sendAndConfirmTransaction(
  title: string,
  connection: Connection,
  transaction: Transaction,
  ...signers: Array<Account | Keypair>
): Promise<TransactionSignature> {
  return realSendAndConfirmTransaction(connection, transaction, signers, {
    skipPreflight: false,
    commitment: 'confirmed',
    preflightCommitment: 'recent',
  });
}

export function round(num: number, decimals: number) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export const escapeRegExp = (str: string) => {
  const specialCharacters = [
    '-',
    '[',
    ']',
    '/',
    '{',
    '}',
    '(',
    ')',
    '*',
    '+',
    '?',
    '.',
    '\\',
    '^',
    '$',
    '|',
  ];
  const regex = RegExp('[' + specialCharacters.join('\\') + ']', 'g');
  return str.replace(regex, '\\$&');
};

export const countDecimals =  (num: number) => {
  if(Math.floor(num.valueOf()) === num.valueOf()) return 0;
  return num.toString().split(".")[1].length || 0;
}

export function addMongooseParam(mongooseObject = {}, key: string, value: string | any) {
  if (!mongooseObject) {
    mongooseObject = {};
  }

  mongooseObject[key] = value;

  return mongooseObject;
}
