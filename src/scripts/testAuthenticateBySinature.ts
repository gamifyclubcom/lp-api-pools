import {envConfig} from '../configs';
import {restoreKeypairFromString} from '../shared/utils/contract-main';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

interface IPayload {
  adminAddress: string;
  iat: number;
  exp: number;
}

interface IPayloadWithSignature extends IPayload {
  signature: Uint8Array;
}

(async () => {
  const payerSecret = envConfig.PAYER_SECRET_KEY;
  const payer = restoreKeypairFromString(payerSecret);

  const payload: IPayload = {
    adminAddress: payer.publicKey.toString(),
    iat: new Date().getTime(),
    exp: new Date().getTime() + 3600,
  };
  const signData = Buffer.from(JSON.stringify(payload));
  console.log(signData.toString('hex'));
  console.log(bs58.encode(signData));
  console.log(JSON.parse(bs58.decode(bs58.encode(signData)).toString()));
  console.log(JSON.stringify(payload));
  const signature = nacl.sign.detached(signData, payer.secretKey);
  const signedData = {
    ...payload,
    signature,
  };

  const res = nacl.sign.detached.verify(signData, signature, payer.publicKey.toBuffer());

  console.log(res);
})();
