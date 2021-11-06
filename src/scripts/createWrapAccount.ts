// ts-node src/scripts/createWrapAccount.ts

import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {getConnection} from '../shared/utils/connection';
import {config as dotenvConfig} from 'dotenv';
import {Actions, Instructions} from '@gamify/onchain-program-sdk';
import {stringToUnit8Array} from '../shared/utils/helper';
import {TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT} from '@project-serum/serum/lib/token-instructions';
import {AccountLayout} from '@solana/spl-token';
dotenvConfig();

const userAccount = Keypair.fromSecretKey(
  stringToUnit8Array(
    'fg2I3K/JBfYXQ8zZwwCFrqZaLmOZKJRa0VjjhcbxgmBaYjkIZIxd/689r3Cihtjb/ukQQhhz7sF4fmMm3lkFgw==',
  ),
);
const userAddress = userAccount.publicKey;
const connection = getConnection();
const action = new Actions(connection);
const ntcACcount = new PublicKey('Eia7gM6zjDJM1VJEvV2JffgFXhYaQTxns2VsGakDAUX9');

const createTheFirstWrapAccount = async () => {
  const wrappedUserAddress = await action.findAssociatedTokenAddress(ntcACcount, WRAPPED_SOL_MINT);
  const {blockhash} = await connection.getRecentBlockhash();
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: userAddress,
  });
  const rentFee = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: userAddress,
      toPubkey: wrappedUserAddress,
      lamports: rentFee,
    }),
    Instructions.createAssociatedTokenAccountInstruction(
      userAddress,
      ntcACcount,
      WRAPPED_SOL_MINT,
      wrappedUserAddress,
    ),
  );

  await sendAndConfirmTransaction(connection, transaction, [userAccount]);
};

const createTheSecondWrapAccount = async () => {
  let wrappedUserAddress = await action.findAssociatedTokenAddress(userAddress, WRAPPED_SOL_MINT);
  const {blockhash} = await connection.getRecentBlockhash();
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: userAddress,
  });
  const rentFee = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  const {needClose, transaction: closeTransaction} = await action.closeAssociatedTokenAccount(
    userAddress,
    userAddress,
  );
  if (needClose) {
    console.log('need to close');
    await sendAndConfirmTransaction(connection, closeTransaction, [userAccount]);
  }

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: userAddress,
      toPubkey: wrappedUserAddress,
      lamports: rentFee,
    }),
    Instructions.createAssociatedTokenAccountInstruction(
      userAddress,
      userAddress,
      WRAPPED_SOL_MINT,
      wrappedUserAddress,
    ),
    Instructions.closeAccountInstruction({
      programId: TOKEN_PROGRAM_ID,
      account: wrappedUserAddress,
      dest: userAddress,
      owner: userAddress,
      signers: [],
    }),
  );

  await sendAndConfirmTransaction(connection, transaction, [userAccount]);
};

(async () => {
  await createTheFirstWrapAccount();
  console.log('done');
})();
