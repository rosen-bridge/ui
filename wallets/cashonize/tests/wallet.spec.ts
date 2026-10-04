import { hashTransaction, hexToBin } from '@bitauth/libauth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import {
  generateBitcoinCashUnsignedLock,
  validateBitcoinCashSignedLock,
} from '@rosen-network/bitcoin-cash';
import {
  BitcoinCashNetwork,
  type BitcoinCashNetworkConfig,
} from '@rosen-network/bitcoin-cash/client';

import {
  parentOutput,
  signIntent,
  signingIntent,
} from '../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import { CashonizeWallet, type CashonizeWalletSession } from '../src/wallet';

const { candidate } = vi.hoisted(() => ({ candidate: { index: 10 } }));
vi.mock('@rosen-ui/constants', async () => {
  const actual = await vi.importActual<typeof import('@rosen-ui/constants')>('@rosen-ui/constants');
  return {
    ...actual,
    NETWORKS: {
      ...actual.NETWORKS,
      'bitcoin-cash': {
        ...actual.NETWORKS['bitcoin-cash'],
        get index() {
          return candidate.index;
        },
      },
    },
  };
});

/** Native BCH and wrapped three-decimal assets in a real validated TokenMap. */
const token: RosenChainToken = {
  tokenId: 'bch',
  name: 'BCH',
  type: 'native',
  residency: 'native',
  decimals: 8,
  extra: {},
};

/** Complete server ports and fake relay lifecycle with actual builder/signature validation. */
const fixture = async () => {
  const map = new TokenMap();
  await map.updateConfigByJson([
    {
      'bitcoin-cash': token,
      ergo: {
        ...token,
        tokenId: '11'.repeat(32),
        type: 'token',
        residency: 'wrapped',
        decimals: 3,
      },
    },
  ]);
  const source = signingIntent().fromAddress;
  const lockAddress = signingIntent().lockAddress;
  const session = {
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    dispose: vi.fn(() => {}),
    getAddress: vi.fn(() => source),
    sign: vi.fn<CashonizeWalletSession['sign']>(async (parameters) => {
      const intent = generateBitcoinCashUnsignedLock(parameters);
      return validateBitcoinCashSignedLock(signIntent(intent), intent);
    }),
  } satisfies CashonizeWalletSession;
  const fees = {
    bridgeFee: 1n,
    networkFee: 1n,
    feeRatio: 0n,
    feeRatioDivisor: 10000n,
    rsnRatio: 0n,
    rsnRatioDivisor: 1n,
  };
  const config = {
    lockAddress,
    nextHeightInterval: 1,
    calculateFee: async () => ({ fees, nextFees: fees }),
    getMaxTransfer: async () => 3n,
    getMinTransfer: async () => 3n,
    validateAddress: async () => true,
    getTokenMap: async () => map,
    getAddressBalance: vi.fn(async () => 100001n),
    generateSigningParameters: vi.fn(async (request) => ({
      ...request,
      lockAddress,
      feeRate: 2,
      maxFee: 10000n,
      utxos: [parentOutput(1, 500000n)],
    })),
    submitTransaction: vi.fn<BitcoinCashNetworkConfig['submitTransaction']>(async (signed) =>
      hashTransaction(hexToBin(signed)),
    ),
  } satisfies BitcoinCashNetworkConfig;
  const network = new BitcoinCashNetwork(config);
  const createSession = vi.fn(async () => session);
  const walletGetTokenMap = vi.fn(async () => map);
  const wallet = new CashonizeWallet({
    networks: [network],
    getTokenMap: walletGetTokenMap,
    createSession,
  });
  const transfer = {
    token,
    amount: 3n,
    fromChain: 'bitcoin-cash' as const,
    toChain: 'ergo' as const,
    address: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    bridgeFee: 1n,
    networkFee: 1n,
    lockAddress,
  };
  return { wallet, network, session, config, createSession, map, transfer, walletGetTokenMap };
};
afterEach(() => {
  candidate.index = 10;
});

describe('CashonizeWallet', () => {
  describe('isAvailable', () => {
    /**
     * @target CashonizeWallet.isAvailable rejects unassigned availability
     * @dependencies Candidate-only network fixture.
     * @scenario
     * - Create the candidate wallet
     * - Remove its network index
     * - Check availability and connection rejection without session creation.
     * @expected Availability is false and no relay initialization occurs.
     */
    it('rejects unassigned availability', async () => {
      const { wallet, createSession } = await fixture();
      candidate.index = -1;
      expect(wallet.isAvailable()).toEqual(false);
      await expect(wallet.connect()).rejects.toThrow();
      expect(createSession).not.toHaveBeenCalled();
    });
  });
  describe('connect', () => {
    /**
     * @target CashonizeWallet.connect joins the wallet lifecycle
     * @dependencies Typed session factory and lifecycle spies.
     * @scenario
     * - Create the wallet
     * - Inspect disconnected state
     * - Connect and read its address
     * - Disconnect
     * - Inspect cleared state and session cleanup.
     * @expected Initialize once and clear connection before closing and
     *   disposing the session.
     */
    it('joins the wallet lifecycle', async () => {
      const { wallet, session, createSession } = await fixture();
      expect(await wallet.hasConnection()).toEqual(false);
      expect(createSession).not.toHaveBeenCalled();
      await wallet.connect();
      expect(await wallet.getAddress()).toEqual(session.getAddress());
      await wallet.disconnect();
      expect(await wallet.hasConnection()).toEqual(false);
      expect(session.disconnect).toHaveBeenCalledOnce();
      expect(session.dispose).toHaveBeenCalledOnce();
    });
    /**
     * @target CashonizeWallet.connect rejects a late factory after disconnect
     * @dependencies Controlled pending factory and session lifecycle spies.
     * @scenario
     * - Hold session creation
     * - Start connecting
     * - Disconnect
     * - Release the session
     * - Check rejection, absent prompt and disposal.
     * @expected Dispose the late session without prompting connection or
     *   retaining authorization.
     */
    it('rejects a late factory after disconnect', async () => {
      const { wallet, session, createSession } = await fixture();
      let release!: (value: typeof session) => void;
      createSession.mockImplementation(
        () =>
          new Promise((resolve) => {
            release = resolve;
          }),
      );
      const connecting = wallet.connect();
      await vi.waitFor(() => expect(createSession).toHaveBeenCalledOnce());
      await wallet.performDisconnect();
      release(session);
      await expect(connecting).rejects.toThrow();
      expect(session.connect).not.toHaveBeenCalled();
      expect(session.dispose).toHaveBeenCalledOnce();
      expect(await wallet.hasConnection()).toEqual(false);
    });
  });
  describe('getBalance', () => {
    /**
     * @target CashonizeWallet.getBalance rejects conversion bound %s
     * @dependencies Real shared map with one independently invalid set field.
     * @scenario
     * - Alter one token-map conversion bound
     * - Connect
     * - Read balance
     * - Check rejection before the provider read.
     * @expected Reject without reading an address balance.
     */
    it.each(['count', 'decimal', 'name'])('rejects conversion bound %s', async (mutation) => {
      const { wallet, config, map } = await fixture();
      const mapping = map.getTokenSet('bch');
      if (!mapping) throw new Error('Missing mapping fixture');
      if (mutation === 'count')
        for (let index = 0; index < 63; index++) mapping[`chain-${index}`] = { ...token };
      if (mutation === 'decimal') mapping.ergo.decimals = -1;
      if (mutation === 'name') mapping.ergo.name = 'x'.repeat(1025);
      await wallet.connect();
      await expect(wallet.getBalance(token)).rejects.toThrow('native conversion unavailable');
      expect(config.getAddressBalance).not.toHaveBeenCalled();
    });
    /**
     * @target CashonizeWallet.getBalance snapshots conversion before the
     * balance read
     * @dependencies Real TokenMap updated in place by the balance port.
     * @scenario
     * - Update token mapping during the provider read
     * - Connect
     * - Read balance
     * - Compare the result with the original mapping.
     * @expected Return the original two wrapped units rather than raw satoshis.
     */
    it('snapshots conversion before the balance read', async () => {
      const { wallet, config, map } = await fixture();
      config.getAddressBalance.mockImplementation(async () => {
        await map.updateConfigByJson([
          { 'bitcoin-cash': token, ergo: { ...token, tokenId: '11'.repeat(32), type: 'token' } },
        ]);
        return 100001n;
      });
      await wallet.connect();
      expect(await wallet.getBalance(token)).toEqual(2n);
    });
    /**
     * @target CashonizeWallet.getBalance wraps native balance with shared
     * ceiling semantics
     * @dependencies Real TokenMap eight-to-three-decimal conversion and
     *   read-only port.
     * @scenario
     * - Connect the mixed-decimal fixture
     * - Read balance
     * - Check ceiling conversion and one provider read.
     * @expected Return two wrapped units without changing the raw provider
     *   balance.
     */
    it('wraps native balance with shared ceiling semantics', async () => {
      const { wallet, config } = await fixture();
      await wallet.connect();
      expect(await wallet.getBalance(token)).toEqual(2n);
      expect(config.getAddressBalance).toHaveBeenCalledOnce();
    });
    /**
     * @target CashonizeWallet.getBalance rejects unsupported asset %j
     * @dependencies Native fixture with one independently changed token field.
     * @scenario
     * - Connect
     * - Alter one requested asset field
     * - Read balance
     * - Check rejection and absent provider reads.
     * @expected Reject before provider reads.
     */
    it.each([{ tokenId: 'other' }, { type: 'token' }, { decimals: 3 }])(
      'rejects unsupported asset %j',
      async (mutation) => {
        const { wallet, config } = await fixture();
        await wallet.connect();
        await expect(wallet.getBalance({ ...token, ...mutation })).rejects.toThrow(
          'mapped eight-decimal',
        );
        expect(config.getAddressBalance).not.toHaveBeenCalled();
      },
    );
  });
  describe('transfer', () => {
    /**
     * @target CashonizeWallet.transfer cancels pending submission on disconnect
     * and retains single-transfer authority
     * @dependencies Actual native builder/signature validation and a controlled
     *   pending HTTP port.
     * @scenario
     * - Hold HTTP submission and start transfer
     * - Attempt a second transfer
     * - Inspect rejection and shared abort signal
     * - Disconnect and check the original submission aborts.
     * @expected Reject concurrency without replacing authority; abort the
     *   original pending submit signal.
     */
    it('cancels pending submission on disconnect and retains single-transfer authority', async () => {
      const { wallet, config, session, transfer } = await fixture();
      let entered: (() => void) | undefined;
      const waiting = new Promise<void>((resolve) => {
        entered = resolve;
      });
      let submittedSignal: AbortSignal | undefined;
      config.submitTransaction.mockImplementation((_signed, _intent, _metadata, signal) => {
        submittedSignal = signal;
        entered?.();
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(new Error('HTTP submission aborted')), {
            once: true,
          });
        });
      });
      await wallet.connect();
      const pending = wallet.transfer(transfer);
      await waiting;
      const rejected = expect(pending).rejects.toThrow(/^HTTP submission aborted$/);
      expect(submittedSignal).toEqual(session.sign.mock.calls[0][1]);
      expect(submittedSignal?.aborted).toEqual(false);
      await expect(wallet.transfer(transfer)).rejects.toThrow(
        /^Cashonize transfer is already pending$/,
      );
      expect(config.submitTransaction).toHaveBeenCalledOnce();
      await wallet.disconnect();
      expect(submittedSignal?.aborted).toEqual(true);
      await rejected;
    });
    /**
     * @target CashonizeWallet.transfer snapshots %s before mapping awaits
     * @dependencies Controlled wallet TokenMap wait and actual
     *   builder/signature validation.
     * @scenario
     * - Hold token-map retrieval
     * - Call the selected transfer entry point
     * - Mutate the request amount
     * - Release mapping
     * - Inspect the original signed amount.
     * @expected Sign the original 300000 satoshis through either entry point.
     */
    it.each(['transfer', 'performTransfer'] as const)(
      'snapshots %s before mapping awaits',
      async (entry) => {
        const { wallet, session, config, transfer, map, walletGetTokenMap } = await fixture();
        await wallet.connect();
        let release!: (map: TokenMap) => void;
        let started!: () => void;
        const ready = new Promise<void>((resolve) => {
          started = resolve;
        });
        walletGetTokenMap.mockImplementation(() => {
          started();
          return new Promise((resolve) => {
            release = resolve;
          });
        });
        const request = { ...transfer };
        const pending = wallet[entry](request);
        await ready;
        request.amount = 4n;
        release(map);
        await pending;
        expect(config.generateSigningParameters.mock.calls[0][0].amount).toEqual(300000n);
        expect(session.sign).toHaveBeenCalledOnce();
      },
    );
    /**
     * @target CashonizeWallet.transfer rejects disconnect before signing starts
     * @dependencies Controlled server preparation and current session
     *   lifecycle.
     * @scenario
     * - Hold signing-parameter preparation
     * - Start transfer
     * - Disconnect
     * - Release preparation
     * - Check rejection before signing or submission.
     * @expected Reject the stale operation before calling sign or submission.
     */
    it('rejects disconnect before signing starts', async () => {
      const { wallet, session, config, transfer } = await fixture();
      const prepare = config.generateSigningParameters.getMockImplementation();
      if (!prepare) throw new Error('Missing fixture preparation');
      let release!: () => void;
      let started!: () => void;
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      config.generateSigningParameters.mockImplementation(async (request) => {
        started();
        await gate;
        return prepare(request);
      });
      await wallet.connect();
      const pending = wallet.transfer(transfer);
      await ready;
      await wallet.disconnect();
      release();
      await expect(pending).rejects.toThrow('session changed before signing');
      expect(session.sign).not.toHaveBeenCalled();
      expect(config.submitTransaction).not.toHaveBeenCalled();
    });
    /**
     * @target CashonizeWallet.transfer preserves original transfer %s
     * @dependencies Actual mixed-decimal transfer, real signature validation
     *   and caller-owned request.
     * @scenario
     * - Start transfer with a copied request
     * - Mutate one caller-owned field
     * - Await completion
     * - Inspect original amount, destination and fees.
     * @expected Sign only the original 300000-satoshi deposit with original
     *   destination and Rosen fee units.
     */
    it.each(['amount', 'token', 'destination', 'fee'])(
      'preserves original transfer %s',
      async (mutation) => {
        const { wallet, session, config, transfer } = await fixture();
        await wallet.connect();
        const request = {
          ...transfer,
          token: { ...transfer.token, extra: { ...transfer.token.extra } },
        };
        const pending = wallet.transfer(request);
        if (mutation === 'amount') request.amount = 4n;
        if (mutation === 'token') request.token.tokenId = 'other';
        if (mutation === 'destination') request.address = 'invalid';
        if (mutation === 'fee') request.bridgeFee = 999n;
        await pending;
        expect(config.generateSigningParameters.mock.calls[0][0]).toEqual({
          fromAddress: session.getAddress(),
          amount: 300000n,
          toChain: 'ergo',
          toAddress: transfer.address,
          bridgeFee: 1n,
          networkFee: 1n,
        });
      },
    );
    /**
     * @target CashonizeWallet.transfer rejects transfer mismatch %s
     * @dependencies Connected native wallet fixture and signing/server spies.
     * @scenario
     * - Connect
     * - Alter one transfer chain, treasury or token field
     * - Transfer
     * - Check rejection before signing and submission.
     * @expected Reject each invalid transfer without signing or submitting.
     */
    it.each(['chain', 'treasury', 'token'])('rejects transfer mismatch %s', async (mutation) => {
      const { wallet, config, session, transfer } = await fixture();
      await wallet.connect();
      const request = { ...transfer };
      if (mutation === 'chain') Object.assign(request, { fromChain: 'bitcoin' });
      if (mutation === 'treasury') request.lockAddress = session.getAddress();
      if (mutation === 'token') request.token = { ...token, tokenId: 'other' };
      await expect(wallet.transfer(request)).rejects.toThrow();
      expect(session.sign).not.toHaveBeenCalled();
      expect(config.submitTransaction).not.toHaveBeenCalled();
    });
    /**
     * @target CashonizeWallet.transfer rejects a signed result after disconnect
     * @dependencies Real verified signature held behind a controlled signing
     *   promise.
     * @scenario
     * - Hold a verified signature
     * - Start transfer
     * - Disconnect
     * - Release signing
     * - Check rejection and absent submission.
     * @expected Reject the stale operation and never invoke the submit
     *   callback.
     */
    it('rejects a signed result after disconnect', async () => {
      const { wallet, config, session, transfer } = await fixture();
      const sign = session.sign.getMockImplementation();
      if (!sign) throw new Error('Missing fixture signer');
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      session.sign.mockImplementation(async (parameters) => {
        await pending;
        return sign(parameters);
      });
      await wallet.connect();
      const transferring = wallet.transfer(transfer);
      await vi.waitFor(() => expect(session.sign).toHaveBeenCalledOnce());
      await wallet.disconnect();
      release();
      await expect(transferring).rejects.toThrow('session changed');
      expect(config.submitTransaction).not.toHaveBeenCalled();
    });
    /**
     * @target CashonizeWallet.transfer unwraps amount only and submits verified
     * signed bytes
     * @dependencies Real TokenMap, builder, Schnorr signature validator and
     *   typed server callback.
     * @scenario
     * - Connect
     * - Transfer the mixed-decimal deposit
     * - Inspect native amount, unchanged fee units, signing/submission calls
     *   and returned transaction hash.
     * @expected Sign 300000 native satoshis with unchanged fees and submit only
     *   verified bytes.
     */
    it('unwraps amount only and submits verified signed bytes', async () => {
      const { wallet, config, session, transfer } = await fixture();
      await wallet.connect();
      const txId = await wallet.transfer(transfer);
      expect(config.generateSigningParameters.mock.calls[0][0]).toEqual({
        fromAddress: session.getAddress(),
        amount: 300000n,
        toChain: 'ergo',
        toAddress: transfer.address,
        bridgeFee: 1n,
        networkFee: 1n,
      });
      expect(session.sign).toHaveBeenCalledOnce();
      expect(config.submitTransaction).toHaveBeenCalledOnce();
      expect(txId).toEqual(hashTransaction(hexToBin(config.submitTransaction.mock.calls[0][0])));
    });
    /**
     * @target CashonizeWallet.transfer rejects fee equality in wrapped units
     * @dependencies Real mixed-decimal TokenMap and native signing/submit
     *   spies.
     * @scenario
     * - Connect
     * - Transfer an amount equal to wrapped fees
     * - Check rejection before preparation, signing or submission.
     * @expected Reject despite 200000 raw satoshis and never sign or submit.
     */
    it('rejects fee equality in wrapped units', async () => {
      const { wallet, config, session, transfer } = await fixture();
      await wallet.connect();
      await expect(wallet.transfer({ ...transfer, amount: 2n })).rejects.toThrow('wrapped deposit');
      expect(config.generateSigningParameters).not.toHaveBeenCalled();
      expect(session.sign).not.toHaveBeenCalled();
      expect(config.submitTransaction).not.toHaveBeenCalled();
    });
  });
});
