import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { Network } from '@rosen-ui/types';
import { Psbt } from 'bitcoinjs-lib';
import { describe, expect, it, vi } from 'vitest';

import { DOGE_NETWORK, generateUnsignedTx } from '../../src';
import { testTokenMap, multiDecimalTokenMap } from '../test-data';

const testData = await vi.hoisted(async () => await import('./testData'));

const getTokenMap = async () => {
  const tokenMap = new TokenMap();
  await tokenMap.updateConfigByJson(testTokenMap);
  return tokenMap;
};

vi.mock('../../src/utils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../src/utils')>();
  // mock getAddressUtxos
  const getAddressUtxos = vi.fn();
  getAddressUtxos.mockResolvedValue(testData.mockedUtxos);
  const getTxHex = vi.fn();
  getTxHex.mockResolvedValue(testData.txHex1);
  // mock getFeeRatio
  const getFeeRatio = vi.fn();
  getFeeRatio.mockResolvedValue(1000);
  return {
    ...mod,
    getAddressUtxos,
    getFeeRatio,
    getTxHex,
  };
});

describe('generateUnsignedTx', () => {
  /**
   * @target generateUnsignedTx should generate lock transaction successfully
   * @dependencies
   * - utils.getAddressUtxos
   * - utils.getFeeRatio
   * @scenario
   * - run test
   * - check returned data
   * @expected
   * - returned inputSize should be equal to inputs count in psbt
   * - input count should be 1
   * - 1st input should be 1st mocked utxo
   * - output count should be 3 (OP_RETURN, lock and change utxos)
   * - 1st output should be OP_RETURN utxo with given data and no Doge
   * - 2nd output should be to lock address with given amount
   * - 3rd output should be to from address with remaining Doge minus fee
   */
  it('should generate lock transaction successfully', async () => {
    const lockAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';
    const fromAddress = 'DMm8bk6atCBoVBX9c3zgiF16ggE31hLmQm';
    const amount = 100000000n;
    const data =
      '00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339';

    const rosenChainToken: RosenChainToken = {
      tokenId: '',
      name: '',
      decimals: 8,
      type: 'native',
      residency: '',
      extra: {},
    };

    const result = await generateUnsignedTx(getTokenMap)(
      lockAddress,
      fromAddress,
      amount,
      data,
      rosenChainToken,
    );

    const psbt = Psbt.fromBase64(result.psbt.base64, { network: DOGE_NETWORK });
    expect(result.inputSize).toEqual(psbt.inputCount);

    expect(psbt.inputCount).toEqual(1);
    const mockedInput = testData.mockedUtxos[0];
    expect(psbt.txInputs[0].hash.reverse().toString('hex')).toEqual(
      mockedInput.txId,
    );
    expect(psbt.txInputs[0].index).toEqual(mockedInput.index);

    expect(psbt.txOutputs.length).toEqual(3);
    const opReturnUtxo = psbt.txOutputs[0];
    expect(opReturnUtxo.script.toString('hex')).toEqual(
      '6a' + // OP_RETURN
        (data.length / 2).toString(16).padStart(2, '0') +
        data,
    );
    expect(opReturnUtxo.value).toEqual(0);
    const lockUtxo = psbt.txOutputs[1];
    expect(lockUtxo.address).toEqual(lockAddress);
    expect(lockUtxo.value).toEqual(Number(amount));
    const changeUtxo = psbt.txOutputs[2];
    expect(changeUtxo.address).toEqual(fromAddress);
    const expectedFee = 287000n;
    expect(changeUtxo.value).toEqual(
      Number(mockedInput.value - amount - expectedFee),
    );
  });

  /**
   * @target generateUnsignedTx should generate lock transaction with multi decimals token map successfully
   * @dependencies
   * - utils.getAddressUtxos
   * - utils.getFeeRatio
   * @scenario
   * - run test
   * - check returned data
   * @expected
   * - returned inputSize should be equal to inputs count in psbt
   * - input count should be 1
   * - 1st input should be 1st mocked utxo
   * - output count should be 3 (OP_RETURN, lock and change utxos)
   * - 1st output should be OP_RETURN utxo with given data and no Doge
   * - 2nd output should be to lock address with given amount
   * - 3rd output should be to from address with remaining Doge minus fee
   */
  it('should generate lock transaction with multi decimals token map successfully', async () => {
    const lockAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';
    const fromAddress = 'DMm8bk6atCBoVBX9c3zgiF16ggE31hLmQm';
    const wrappedAmount = 1000000n;
    const unwrappedAmount = 100000000n;
    const data =
      '00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339';

    const tokenMap = new TokenMap();

    await tokenMap.updateConfigByJson(multiDecimalTokenMap);

    const chain = tokenMap.getAllChains()[0] as Network;

    const token = tokenMap.search(chain, {})[0][chain];

    const result = await generateUnsignedTx(() => Promise.resolve(tokenMap))(
      lockAddress,
      fromAddress,
      wrappedAmount,
      data,
      token,
    );

    const psbt = Psbt.fromBase64(result.psbt.base64, { network: DOGE_NETWORK });
    expect(result.inputSize).toEqual(psbt.inputCount);

    expect(psbt.inputCount).toEqual(1);
    const mockedInput = testData.mockedUtxos[0];
    expect(psbt.txInputs[0].hash.reverse().toString('hex')).toEqual(
      mockedInput.txId,
    );
    expect(psbt.txInputs[0].index).toEqual(mockedInput.index);

    expect(psbt.txOutputs.length).toEqual(3);
    const opReturnUtxo = psbt.txOutputs[0];
    expect(opReturnUtxo.script.toString('hex')).toEqual(
      '6a' + // OP_RETURN
        (data.length / 2).toString(16).padStart(2, '0') +
        data,
    );
    expect(opReturnUtxo.value).toEqual(0);
    const lockUtxo = psbt.txOutputs[1];
    expect(lockUtxo.address).toEqual(lockAddress);
    expect(lockUtxo.value).toEqual(Number(unwrappedAmount));
    const changeUtxo = psbt.txOutputs[2];
    expect(changeUtxo.address).toEqual(fromAddress);
    const expectedFee = 287000n;
    expect(changeUtxo.value).toEqual(
      Number(mockedInput.value - unwrappedAmount - expectedFee),
    );
  });

  /**
   * @target generateUnsignedTx should throw error when address utxos cannot cover required Doge
   * @dependencies
   * - utils.getAddressUtxos
   * - utils.getFeeRatio
   * @scenario
   * - run test and check thrown exception
   * @expected
   * - it should throw Error
   */
  it('should throw error when address utxos cannot cover required Doge', async () => {
    const lockAddress = 'DHTom1rFwsgAn5raKU1nok8E5MdQ4GBkAN';
    const fromAddress = 'DMm8bk6atCBoVBX9c3zgiF16ggE31hLmQm';
    const amount = 350000000000n;
    const data =
      '00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339';

    const rosenChainToken: RosenChainToken = {
      tokenId: '',
      name: '',
      decimals: 8,
      type: 'native',
      residency: '',
      extra: {},
    };
    await expect(async () => {
      await generateUnsignedTx(getTokenMap)(
        lockAddress,
        fromAddress,
        amount,
        data,
        rosenChainToken,
      );
    }).rejects.toThrow(Error);
  });
});
