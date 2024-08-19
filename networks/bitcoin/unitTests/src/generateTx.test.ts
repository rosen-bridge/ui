import { describe, expect, it, vi } from 'vitest';
import { Psbt } from 'bitcoinjs-lib';
import { generateUnsignedTx } from '../../src';
import { testTokenMap, multiDecimalTokenMap } from '../test-data';
import { TokenMap } from '@rosen-bridge/tokens';

const testData = await vi.hoisted(async () => await import('./testData'));

vi.mock('../../src/utils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../src/utils')>();
  // mock getAddressUtxos
  const getAddressUtxos = vi.fn();
  getAddressUtxos.mockResolvedValue(testData.mockedUtxos);
  // mock getFeeRatio
  const getFeeRatio = vi.fn();
  getFeeRatio.mockResolvedValue(1);
  return {
    ...mod,
    getAddressUtxos,
    getFeeRatio,
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
   * - 1st output should be OP_RETURN utxo with given data and no BTC
   * - 2nd output should be to lock address with given amount
   * - 3rd output should be to from address with remaining BTC minus fee
   */
  it('should generate lock transaction successfully', async () => {
    const lockAddress = 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h';
    const fromAddress = 'bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d';
    const amount = 500000000n;
    const data =
      '00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339';

    const result = await generateUnsignedTx(new TokenMap(testTokenMap))(
      lockAddress,
      fromAddress,
      amount,
      data,
      {} as any
    );

    const psbt = Psbt.fromBase64(result.psbt);
    expect(result.inputSize).toEqual(psbt.inputCount);

    expect(psbt.inputCount).toEqual(1);
    const mockedInput = testData.mockedUtxos[0];
    expect(psbt.txInputs[0].hash.reverse().toString('hex')).toEqual(
      mockedInput.txId
    );
    expect(psbt.txInputs[0].index).toEqual(mockedInput.index);

    expect(psbt.txOutputs.length).toEqual(3);
    const opReturnUtxo = psbt.txOutputs[0];
    expect(opReturnUtxo.script.toString('hex')).toEqual(
      '6a' + // OP_RETURN
        (data.length / 2).toString(16).padStart(2, '0') +
        data
    );
    expect(opReturnUtxo.value).toEqual(0);
    const lockUtxo = psbt.txOutputs[1];
    expect(lockUtxo.address).toEqual(lockAddress);
    expect(lockUtxo.value).toEqual(Number(amount));
    const changeUtxo = psbt.txOutputs[2];
    expect(changeUtxo.address).toEqual(fromAddress);
    const expectedFee = 203n;
    expect(changeUtxo.value).toEqual(
      Number(mockedInput.value - amount - expectedFee)
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
   * - 1st output should be OP_RETURN utxo with given data and no BTC
   * - 2nd output should be to lock address with given amount
   * - 3rd output should be to from address with remaining BTC minus fee
   */
  it('should generate lock transaction with multi decimals token map successfully', async () => {
    const lockAddress = 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h';
    const fromAddress = 'bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d';
    const wrappedAmount = 5000000n;
    const unwrappedAmount = 500000000n;
    const data =
      '00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339';

    const tokenMap = new TokenMap(multiDecimalTokenMap);

    const chain = tokenMap.getAllChains()[0];

    const token = tokenMap.search(chain, {})[0][chain];

    const result = await generateUnsignedTx(tokenMap)(
      lockAddress,
      fromAddress,
      wrappedAmount,
      data,
      token
    );

    const psbt = Psbt.fromBase64(result.psbt);
    expect(result.inputSize).toEqual(psbt.inputCount);

    expect(psbt.inputCount).toEqual(1);
    const mockedInput = testData.mockedUtxos[0];
    expect(psbt.txInputs[0].hash.reverse().toString('hex')).toEqual(
      mockedInput.txId
    );
    expect(psbt.txInputs[0].index).toEqual(mockedInput.index);

    expect(psbt.txOutputs.length).toEqual(3);
    const opReturnUtxo = psbt.txOutputs[0];
    expect(opReturnUtxo.script.toString('hex')).toEqual(
      '6a' + // OP_RETURN
        (data.length / 2).toString(16).padStart(2, '0') +
        data
    );
    expect(opReturnUtxo.value).toEqual(0);
    const lockUtxo = psbt.txOutputs[1];
    expect(lockUtxo.address).toEqual(lockAddress);
    expect(lockUtxo.value).toEqual(Number(unwrappedAmount));
    const changeUtxo = psbt.txOutputs[2];
    expect(changeUtxo.address).toEqual(fromAddress);
    const expectedFee = 203n;
    expect(changeUtxo.value).toEqual(
      Number(mockedInput.value - unwrappedAmount - expectedFee)
    );
  });

  /**
   * @target generateUnsignedTx should throw error when address utxos cannot cover required BTC
   * @dependencies
   * - utils.getAddressUtxos
   * - utils.getFeeRatio
   * @scenario
   * - run test and check thrown exception
   * @expected
   * - it should throw Error
   */
  it('should throw error when address utxos cannot cover required BTC', async () => {
    const lockAddress = 'bc1qkgp89fjerymm5ltg0hygnumr0m2qa7n22gyw6h';
    const fromAddress = 'bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d';
    const amount = 3500000000n;
    const data =
      '00000000007554fc820000000000962f582103f999da8e6e42660e4464d17d29e63bc006734a6710a24eb489b466323d3a9339';

    await expect(async () => {
      await generateUnsignedTx(new TokenMap(testTokenMap))(
        lockAddress,
        fromAddress,
        amount,
        data,
        {} as any
      );
    }).rejects.toThrow(Error);
  });
});
