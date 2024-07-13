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

    const userAddress: string = await new Promise((resolve, reject) => {
      request('getAddresses', {
        message: '',
        purposes: [AddressPurpose.Payment],
      })
        .then((response) => {
          if (response.status == 'error') return reject();

          const segwitPaymentAddresses = response.result.addresses.filter(
            (address) => address.purpose === AddressPurpose.Payment
          );

          if (segwitPaymentAddresses.length > 0)
            resolve(segwitPaymentAddresses[0].address);
          else reject();
        })
        .catch(() => {
          reject();
        });
    });

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

    const response = await request('signPsbt', {
      psbt: psbtData.psbt,
      allowedSignHash: SigHash.ALL,
      signInputs: {
        [userAddress]: [0],
      },
      broadcast: false,
    });

    if (response.status == 'error') throw undefined;

    return await config.submitTransaction(response.result.psbt);
  };
