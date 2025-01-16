//@ts-ignore
import { hdkey as HDKey } from 'ethereumjs-wallet';

import { keccak256 } from 'js-sha3';
import { hexToBs58, publicKeyToAddress, toBase58Check } from './Address';
import Mnemonic, { MnemonicLangEnum } from './Mnemonic';

import {
  bufferToHex
} from 'ethereumjs-util';
export const TRON_HD_PATH = "m/44'/195'/0'";
export const BTC_HD_PATH = "m/44'/0'/0'";
export const ETH_HD_PATH = "m/44'/60'/0'";
export const PTP_HD_PATH = "m/44'/60'/1'";
export const PTP_GROUP_HD_PATH = "m/44'/60'/1'";

export enum EncryptType {
  EncryptType_Wallet,
  EncryptType_Group,
}

const keccak256ToBuffer = (input:Buffer) => {
  // Compute keccak256 hash and get the result as an ArrayBuffer
  const arrayBuffer = keccak256.arrayBuffer(input);
  // Convert ArrayBuffer to Buffer
  return Buffer.from(arrayBuffer);
};


// 将地址转换为 EIP-55 格式（区分大小写）
const toChecksumAddress = (address:string) => {
  // 去掉0x前缀并转成小写
  const addressNoPrefix = address.slice(2).toLowerCase();
  
  // 计算 Keccak-256 哈希
  const hash = keccak256(addressNoPrefix);
  
  let checksumAddress = '0x';
  
  // 根据哈希值来决定每个字符的大小写
  for (let i = 0; i < 40; i++) {
    // 如果哈希值中的第i位大于或等于8，则使用大写字母
    checksumAddress += parseInt(hash[i], 16) >= 8
      ? addressNoPrefix[i].toUpperCase()
      : addressNoPrefix[i];
  }
  
  return checksumAddress;
};
export const pubKey64ToAddressHex = (pubKey_:Buffer)=>{
  const keccakHash = keccak256ToBuffer(pubKey_)
  const b = Buffer.from(keccakHash.buffer, keccakHash.byteOffset + keccakHash.length - 20, 20)
  return bufferToHex(b) ;
}

export default class Wallet {
  private __masterKey: any | undefined;

  constructor(mnemonic: Mnemonic, password?: string | undefined) {
    const seed = mnemonic.toSeedBuffer(password);
    this.__masterKey = HDKey.fromMasterSeed(seed);
    Object.defineProperty(this, '__masterKey', {
      value: HDKey.fromMasterSeed(seed),
      writable: false,
    });
  }

  getMashKey() {
    return this.__masterKey!;
  }
  getBIP32RootKey(): string {
    if (!this.__masterKey) {
      throw new Error('Master key is not initialized');
    }

    // Serialize the master key to get the extended private key (xprv)
    return this.__masterKey.privateExtendedKey();
  }

  static fromEntropy(
    entropy: string,
    password: string | undefined,
    lang: MnemonicLangEnum | undefined
  ) {
    const mnemonic = Mnemonic.fromEntropy(entropy, lang);
    return new Wallet(mnemonic, password);
  }

  getChild(
    root: string,
    childIndex = 0,
    changeIndex: number = 0,
    hex: boolean = false
  ) {
    const path = `${root}/${changeIndex}/${childIndex}`;
    const childKey = this.getMashKey().derivePath(path);
    let prvKey = childKey._hdkey.privateKey;
    const pubKey = childKey._hdkey.publicKey;
    const pubKey_ = childKey.getWallet().getPublicKey();
    const addressHex = pubKey64ToAddressHex(pubKey_)
    //console.log({ pubKey_ }, pubKey_.toString('hex'));
    let address;
    let prvKeyBs58;
    let addressEIP55;
    if (path.indexOf(BTC_HD_PATH) === 0) {
      address = publicKeyToAddress(pubKey);
      prvKeyBs58 = hexToBs58(Wallet.bufferToHex(prvKey));
    } else if (path.indexOf(TRON_HD_PATH) === 0) {
      const addressBuffer = Buffer.from(
        addressHex.substring(2),
        'hex'
      );
      address = toBase58Check(addressBuffer, 0x41);
    } else {
      address = addressHex;
      addressEIP55 = toChecksumAddress(addressHex)
    }

    if (hex) {
      return {
        path,
        addressEIP55,
        address,
        prvKeyBs58,
        prvKey: Wallet.bufferToHex(prvKey),
        pubKey: Wallet.bufferToHex(pubKey),
        pubKey_: Wallet.bufferToHex(pubKey_),
      };
    } else {
      return {
        path,
        addressEIP55,
        address,
        prvKey,
        pubKey,
        pubKey_,
      };
    }
  }

  static bufferToHex(buffer: Buffer) {
    return '0x' + buffer.toString('hex');
  }

  // Add the new getTronWallet function
  getTronWallet(childIndex: number, hex?: boolean) {
    return this.getChild(TRON_HD_PATH, childIndex, 0, !!hex);
  }

  // Add the new getBtcWallet function
  getBtcWallet(childIndex: number, hex?: boolean) {
    return this.getChild(BTC_HD_PATH, childIndex, 0, !!hex);
  }

  getEthWallet(childIndex: number, hex?: boolean) {
    return this.getChild(ETH_HD_PATH, childIndex, 0, !!hex);
  }

  getPTPWallet(childIndex: number, hex?: boolean) {
    return this.getChild(
      PTP_HD_PATH,
      childIndex,
      EncryptType.EncryptType_Wallet,
      !!hex
    );
  }

  getPTPEncryptWallet(childIndex: number, type: EncryptType) {
    return this.getChild(PTP_HD_PATH, childIndex, type, false);
  }

  getGroupWallet(childIndex: number, hex?: boolean) {
    return this.getChild(
      PTP_GROUP_HD_PATH,
      childIndex,
      EncryptType.EncryptType_Group,
      !!hex
    );
  }
}
