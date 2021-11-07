import {Keypair} from '@solana/web3.js';

export const generateAcc = () => {
  const newAccount = Keypair.generate();
  console.log('create newAccount: ', {
    secret: Buffer.from(newAccount.secretKey).toString('base64'),
    publicKey: newAccount.publicKey.toBase58(),
  });
};

generateAcc();
