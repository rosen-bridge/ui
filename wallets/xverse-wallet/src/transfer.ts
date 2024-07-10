import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  SigHash,
  WalletCreatorConfig,
} from '@rosen-network/bitcoin/dist/src/types';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';
import { AddressPurpose, RpcErrorCode, request } from 'sats-connect';

export const transferCreator =
  (config: WalletCreatorConfig) =>
  async (
    token: RosenChainToken,
    decimalAmount: number,
    toChain: string,
    toAddress: string,
    decimalBridgeFee: number,
    decimalNetworkFee: number,
    lockAddress: string
  ): Promise<string> => {
    validateDecimalPlaces(decimalAmount, token.decimals);
    validateDecimalPlaces(decimalBridgeFee, token.decimals);
    validateDecimalPlaces(decimalNetworkFee, token.decimals);

    const amount = convertNumberToBigint(decimalAmount * 10 ** token.decimals);
    const bridgeFee = convertNumberToBigint(
      decimalBridgeFee * 10 ** token.decimals
    );
    const networkFee = convertNumberToBigint(
      decimalNetworkFee * 10 ** token.decimals
    );

    let userAddress = '';

    try {
      const response = await request('getAddresses', {
        message: '',
        purposes: [AddressPurpose.Payment],
      });

      if (response.status == 'error') throw new Error('TODO');

      const addresses = response.result.addresses.filter(
        (address) => address.purpose === AddressPurpose.Payment
      );

      if (addresses.length == 0) throw new Error('TODO');

      userAddress = addresses[0].address;
    } catch {
      throw new Error('TODO');
    }

    const opReturnData = await config.generateOpReturnData(
      toChain,
      toAddress,
      networkFee.toString(),
      bridgeFee.toString()
    );

    const psbtData = await config.generateUnsignedTx(
      lockAddress,
      userAddress,
      amount,
      opReturnData
    );

    try {
      const response = await request('signPsbt', {
        psbt: psbtData.psbt,
        allowedSignHash: SigHash.ALL,
        signInputs: {
          [userAddress]: [0],
        },
        broadcast: false,
      });
      if (response.status === 'success') {
        console.log('signPsbt: handle success response', response);
        try {
          const r = await config.submitTransaction(response.result.psbt);
          console.log('submitTransaction: handle success response', r);
          return r;
        } catch (err) {
          console.log('submitTransaction: handle error', err);
          throw '';
        }
      } else {
        if (response.error.code === RpcErrorCode.USER_REJECTION) {
          console.log('signPsbt: handle user request cancelation');
        } else {
          console.log('signPsbt: handle error');
        }
        throw '';
      }
    } catch (err) {
      console.log('signPsbt: catch', err);
      throw err;
    }
  };
