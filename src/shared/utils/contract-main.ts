import {Keypair, PublicKey} from '@solana/web3.js';
import {getConnection} from './connection';
import {PoolData, PoolLayout} from './contract-layout';
import {ICampaign, IFee, IRate} from './interface';
import {Pool} from './pool';
// import {POOL_PROGRAM_ID} from '@gamify/onchain-program-sdk';

const connection = getConnection();

// export async function initPool({
//   rootAdminAddress,
//   platformAddress,
//   initPoolData,
//   payer,
//   poolContractAccount,
//   poolTokenXAccount,
//   poolTokenYAccount,
// }: {
//   tokenAddress: string;
//   rootAdminAddress: string;
//   payer: string;
//   platformAddress: string;
//   initPoolData: {
//     rate: IRate;
//     fees: IFee;
//     campaign: ICampaign;
//   };
//   token_to: string;
//   poolTokenXAccount: string;
//   poolTokenYAccount: string;
//   poolContractAccount: PublicKey;
// }) {
//   const rootAdminAccount = new PublicKey(rootAdminAddress);
//   const payerAccount = new PublicKey(payer);

//   const [poolAuthority, nonce] = await PublicKey.findProgramAddress(
//     [poolContractAccount.toBuffer()],
//     new PublicKey(POOL_PROGRAM_ID),
//   );

//   return Pool.createPool(
//     connection,
//     {
//       poolAccount: poolContractAccount,
//       payerAccount,
//       platformAccount: new PublicKey(platformAddress),
//       rootAdminAccount,
//       authority: poolAuthority,
//       tokenAccountX: new PublicKey(poolTokenXAccount),
//       tokenAccountY: new PublicKey(poolTokenYAccount),
//     },
//     new PublicKey(POOL_PROGRAM_ID),
//     {nonce, ...initPoolData},
//   );
// }

export async function readPoolData(address: string): Promise<PoolData> {
  const accData = await connection.getAccountInfo(new PublicKey(address));
  const buffer = Buffer.from(accData.data);
  const decode = PoolLayout.decode(buffer);

  // convert isInitialized to boolean (because when decode, result only is 1 or 0)
  decode.isInitialized = Boolean(decode.isInitialized);

  return decode;
}

export function restoreKeypairFromString(secretKey: string): Keypair {
  return Keypair.fromSecretKey(Buffer.from(secretKey, 'base64'));
}
