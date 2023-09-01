import { ergTokenNameEIP12, minBoxValue, ergoFee, Chains } from '@/_constants';

const feeString = ergoFee;

export class Nautilus {
  context: any;

  constructor() {
    this.context = null;
  }

  async getContext() {
    if (!(await this.isConnected())) {
      console.error('Failed to connect!');
      return;
    }
    if (this.context == null) {
      this.context = await (window as any).ergoConnector.nautilus.getContext();
    }
    return this.context;
  }

  async connect() {
    const granted = await (window as any).ergoConnector?.nautilus?.connect({
      createErgoObject: false,
    });

    if (!granted) {
      console.error('Failed to connect!');
      return false;
    }
    return true;
  }

  async isConnected() {
    return (window as any).ergoConnector?.nautilus?.isConnected();
  }

  async getBalance(token: string) {
    const context = await this.getContext();
    return context.get_balance(
      token === Chains.ergo ? ergTokenNameEIP12 : token,
    );
  }

  async getUtxos(amount: number, token: string) {
    const context = await this.getContext();
    const tokenId = token === Chains.ergo ? ergTokenNameEIP12 : token;
    const tokenUTXOs = await context.get_utxos(amount, tokenId);
    const minErgRequired = 2 * Number(minBoxValue) + Number(feeString);
    let ergAmount = 0;
    const boxIds: string[] = [];
    for (const box of tokenUTXOs) {
      ergAmount += Number(box.value);
      boxIds.push(box.boxId);
    }
    if (ergAmount < minErgRequired) {
      let extraUTXOs = await context.get_utxos(minErgRequired, 'ERG');
      extraUTXOs = extraUTXOs.filter((box: any) => {
        return boxIds.indexOf(box.boxId) === -1;
      });
      tokenUTXOs.push(...extraUTXOs);
    }
    return tokenUTXOs;
  }

  async getChangeAddress() {
    const context = await this.getContext();
    return context.get_change_address();
  }

  async signTX(tx: unknown) {
    const context = await this.getContext();
    return context.sign_tx(tx);
  }

  async submitTx(tx: unknown) {
    const context = await this.getContext();
    return context.submit_tx(tx);
  }
}
