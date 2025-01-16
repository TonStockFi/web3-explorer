import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import bs58 from 'bs58';
import { sha3_256 } from 'js-sha3';
import nacl from 'tweetnacl';


export const APTOS_HD_PATH = "m/44'/637'/0'/0'/0'";
export const SUI_HD_PATH = "m/44'/784'/0'/0'/0'";
export const SOL_HD_PATH = "m/44'/501'/0'/0'";

export default class WalletEd25519 {
  private __masterKey: HDKey;

  constructor(mnemonic: string, password?: string) {
    const seed = mnemonicToSeedSync(mnemonic, password);
    this.__masterKey = HDKey.fromMasterSeed(seed);
  }

  getMasterKey() {
    return this.__masterKey;
  }

  getChild(path: string) {
    const childKey = this.__masterKey.derive(path);
    const privateKey = childKey.privateKey!;
    const keyPair = nacl.sign.keyPair.fromSeed(privateKey);
    const publicKey = keyPair.publicKey;

    return {
      path,
      privateKey: Buffer.from(privateKey).toString('hex'),
      publicKey: Buffer.from(publicKey).toString('hex'),
    };
  }

  getAptosWallet() {
    const { publicKey, privateKey } = this.getChild(APTOS_HD_PATH);
    const address = sha3_256(Buffer.from(publicKey, 'hex')).substring(0, 64);
    return { path: APTOS_HD_PATH, address, publicKey, privateKey };
  }

  getSuiWallet() {
    const { publicKey, privateKey } = this.getChild(SUI_HD_PATH);
    const suiAddress =
      '0x' + sha3_256(Buffer.from(publicKey, 'hex')).substring(0, 64);
    return { path: SUI_HD_PATH, address: suiAddress, publicKey, privateKey };
  }

  getSolWallet() {
    const { publicKey, privateKey } = this.getChild(SOL_HD_PATH);
    //@ts-ignore
    const solAddress = bs58.encode(Buffer.from(publicKey, 'hex'));
    return { path: SOL_HD_PATH, address: solAddress, publicKey, privateKey };
  }
}
