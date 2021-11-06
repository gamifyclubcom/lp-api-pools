import { Schema } from 'mongoose';
import { Keypair, PublicKey } from '@solana/web3.js';

const a = [161,68,65,51,94,88,235,192,102,21,120,37,101,119,13,206,213,228,204,188,43,78,93,168,196,78,154,244,99,125,218,212,3,222,182,189,236,200,203,59,18,130,142,13,154,154,121,161,113,20,251,147,168,174,208,112,253,35,22,230,227,204,98,228]


const buffer = Buffer.from(a);
const  b = buffer.toString('base64');
console.log(b)

const c = Buffer.from(b, 'base64')
console.log(c)


const  d = c.toString('base64');
console.log(d)
