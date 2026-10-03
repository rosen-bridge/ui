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
     * @target Unassigned chain registration never offers a usable wallet.
     * @dependencies Candidate-only network fixture.
     * @scenario Change the registry to its real unassigned value after constructing test ports.
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
     * @target Relay initialization is lazy and local authorization follows explicit connection.
     * @dependencies Typed session factory and lifecycle spies.
     * @scenario Connect, retrieve the authorized address, then disconnect.
     * @expected Initialize once and clear connection before closing and disposing the session.
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
     * @target A late session factory cannot reconnect after local disconnection.
     * @dependencies Controlled pending factory and session lifecycle spies.
     * @scenario Disconnect before the factory resolves and then release the result.
     * @expected Dispose the late session without prompting connection or retaining authorization.
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
     * @target Balance conversion copies enforce bounded mapping primitives before provider reads.
     * @dependencies Real shared map with one independently invalid set field.
     * @scenario Exceed chain count, use negative decimals or an oversized token name.
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
     * @target Native balance conversion retains its mapping across the provider await.
     * @dependencies Real TokenMap updated in place by the balance port.
     * @scenario Change the shared Ergo decimals from three to eight during the read.
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
     * @target Wallet-base amounts use the shared Rosen wrapping and explicit native mapping.
     * @dependencies Real TokenMap eight-to-three-decimal conversion and read-only port.
     * @scenario Read 100001 satoshis through the wallet facade.
     * @expected Return two wrapped units without changing the raw provider balance.
     */
    it('wraps native balance with shared ceiling semantics', async () => {
      const { wallet, config } = await fixture();
      await wallet.connect();
      expect(await wallet.getBalance(token)).toEqual(2n);
      expect(config.getAddressBalance).toHaveBeenCalledOnce();
    });
    /**
     * @target Unsupported assets never reach native balance reads.
     * @dependencies Native fixture with one independently changed token field.
     * @scenario Change identifier, type or decimals.
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
     * @target Disconnect cancels the same transfer signal passed through signing and browser submission.
     * @dependencies Actual native builder/signature validation and a controlled pending HTTP port.
     * @scenario Start submission, attempt a concurrent transfer, then disconnect the wallet.
     * @expected Reject concurrency without replacing authority; abort the original pending submit signal.
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
     * @target Both public and direct transfer entry preserve intent during an awaited mapping lookup.
     * @dependencies Controlled wallet TokenMap wait and actual builder/signature validation.
     * @scenario Wait until mapping lookup starts, mutate caller amount, then release the original map.
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
     * @target Disconnection before prepared parameters arrive starts no wallet signing operation.
     * @dependencies Controlled server preparation and current session lifecycle.
     * @scenario Disconnect while preparation waits, then release otherwise valid parameters.
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
     * @target Public transfer snapshots primitive intent and nested token identity before any await.
     * @dependencies Actual mixed-decimal transfer, real signature validation and caller-owned request.
     * @scenario Independently mutate amount, nested token, destination or fee immediately after starting transfer.
     * @expected Sign only the original 300000-satoshi deposit with original destination and Rosen fee units.
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
     * @target Native transfer rejects mismatched custody/source or an unsupported asset before signing.
     * @dependencies Connected native wallet fixture and signing/server spies.
     * @scenario Independently change source chain, treasury or token identifier.
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
     * @target Local disconnection during signing prevents submission even if late bytes are valid.
     * @dependencies Real verified signature held behind a controlled signing promise.
     * @scenario Disconnect after signing starts then return the previously valid response.
     * @expected Reject the stale operation and never invoke the submit callback.
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
     * @target Only wrapped deposit amount is unwrapped; Rosen metadata fees retain their exact quoted units.
     * @dependencies Real TokenMap, builder, Schnorr signature validator and typed server callback.
     * @scenario Transfer three wrapped units with one unit of each Rosen fee.
     * @expected Sign 300000 native satoshis with unchanged fees and submit only verified bytes.
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
     * @target Wrapped fee coverage rejects a raw-funded but Rosen-underfunded deposit before signing.
     * @dependencies Real mixed-decimal TokenMap and native signing/submit spies.
     * @scenario Transfer two wrapped units with total Rosen fees of two units.
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
