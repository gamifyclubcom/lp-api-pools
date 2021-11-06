import {Actions} from '@intersola/onchain-program-sdk';
import {PublicKey} from '@solana/web3.js';
import {getConnection} from '../shared/utils/connection';

const a = async () => {
  const connect = getConnection();
  const action = new Actions(connect);
  const pool = await action.readPoolV4(
    new PublicKey('8CuNtJtps9Mx2WrBFR76cGiSkMf1UYy1i1STxAu6Em5a'),
  );
  console.log(pool);
};

(async () => {
  await a();
})();
