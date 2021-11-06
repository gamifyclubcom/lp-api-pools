import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';

@Injectable()
export class ParseOnchainAddressPipe implements PipeTransform {
  transform(value: any): string {
    try {
      new PublicKey(value);
    } catch (err) {
      throw new BadRequestException('Wallet address is not a valid address');
    }

    return value;
  }
}
