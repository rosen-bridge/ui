import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

/** Execute the actual provider with controlled hook slots and deferred wallet ports. */
const fixture = () => {
  let source = { name: 'bitcoin-cash' };
  let slot = 0;
  const slots: unknown[] = [];
  const updates: (() => void)[] = [];
  const storage = new Map<string, string>();
  const toast = vi.fn();
  /** Retain hook state/ref slots and execute effects only when dependencies change. */
  const react = {
    /** Supply the context identity consumed by the provider. */
    createContext: () => ({}),
    /** Keep unused context reads out of this controlled provider fixture. */
    useContext: () => undefined,
    /** Preserve state values between explicit renders. */
    useState: (initial: unknown) => {
      const index = slot++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value: unknown) => {
          slots[index] = value;
        },
      ];
    },
    /** Preserve one mutable ref object per hook slot. */
    useRef: (initial: unknown) => {
      const index = slot++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    /** Keep the current callback so each render captures its own source. */
    useCallback: (callback: unknown) => callback,
    /** Evaluate the provider's registry/value derivations on render. */
    useMemo: (callback: () => unknown) => callback(),
    /** Schedule cleanup before replacement effects using dependency identity. */
    useEffect: (effect: () => (() => void) | undefined, dependencies: unknown[]) => {
      const index = slot++;
      const old = slots[index] as { dependencies: unknown[]; cleanup?: () => void } | undefined;
      if (!old || dependencies.some((value, position) => value !== old.dependencies[position])) {
        updates.push(() => {
          old?.cleanup?.();
          slots[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  /** Construct independent wallet ports whose asynchronous boundaries can be held. */
  const createWallet = (name = 'Cashonize') => ({
    name,
    supportedChains: ['bitcoin-cash'],
    initialize: vi.fn(async () => {}),
    connect: vi.fn(async () => {}),
    switchChain: vi.fn(async () => {}),
    getAddress: vi.fn(async () => 'bitcoincash:fixture'),
    disconnect: vi.fn(async () => {}),
    isAvailable: () => true,
    isConnected: vi.fn(async () => true),
  });
  const wallet = createWallet();
  const module = {
    exports: {} as {
      WalletProvider: (props: unknown) => {
        props: {
          value: {
            select: (input: typeof wallet) => Promise<void>;
            disconnect: () => Promise<void>;
            selected?: typeof wallet;
            state: string;
          };
        };
      };
    },
  };
  const compiled = ts.transpileModule(
    readFileSync(new URL('../../src/hooks/useWallet.tsx', import.meta.url), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  runInNewContext(compiled, {
    module,
    exports: module.exports,
    console,
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    require: (id: string) => {
      if (id === 'react') return react;
      if (id === 'react/jsx-runtime')
        return { jsx: (_type: unknown, props: unknown) => ({ props }) };
      if (id === '@rosen-bridge/ui-kit') return { useToast: () => ({ add: toast }) };
      if (id === '@/wallets') return { default: { cashonize: wallet } };
      if (id === './useNetwork') return { useNetwork: () => ({ selectedSource: source }) };
      throw new Error('Unexpected provider import');
    },
  });
  /** Render stable hook slots and flush only dependency-changing effects. */
  const render = () => {
    slot = 0;
    const value = module.exports.WalletProvider({ children: null }).props.value;
    for (const update of updates.splice(0)) update();
    return value;
  };
  return {
    wallet,
    createWallet,
    render,
    toast,
    storage,
    /** Change the source observed by the next provider render. */
    changeSource: (name: string) => {
      source = { name };
    },
    /** Execute registered effect cleanup without mounting a replacement provider. */
    unmount: () => {
      for (const value of slots) (value as { cleanup?: () => void } | undefined)?.cleanup?.();
    },
  };
};

/** Provide an explicitly controlled asynchronous wallet result. */
const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
};

describe('WalletProvider', () => {
  describe('select', () => {
    /** @target select @dependencies controlled source and wallet @scenario source changes during connect @expected no stale authority or storage */
    it('discards a connection completed after changing source', async () => {
      const test = fixture();
      const wait = deferred();
      test.wallet.connect.mockImplementation(() => wait.promise);
      const selection = test.render().select(test.wallet);
      await vi.waitFor(() => expect(test.wallet.connect).toHaveBeenCalledTimes(1));
      test.changeSource('ergo');
      test.render();
      wait.resolve();
      await selection;
      expect(test.render().selected).toEqual(undefined);
      expect(test.wallet.switchChain).not.toHaveBeenCalled();
      expect(test.wallet.disconnect).toHaveBeenCalledTimes(1);
      expect([...test.storage]).toEqual([]);
    });
    /** @target select @dependencies two controlled wallets @scenario earlier connect rejects after replacement @expected newer selection survives */
    it('does not let an old failure clear a newer selection', async () => {
      const test = fixture();
      const wait = deferred();
      const second = test.createWallet('Second');
      test.wallet.connect.mockImplementation(() => wait.promise);
      const old = test.render().select(test.wallet);
      await vi.waitFor(() => expect(test.wallet.connect).toHaveBeenCalledTimes(1));
      await test.render().select(second);
      wait.reject(new Error('old SDK detail'));
      await old;
      expect(test.render().selected).toEqual(second);
      expect(test.render().state).toEqual('CONNECTED');
      expect(test.toast).not.toHaveBeenCalled();
      expect(test.storage.get('rosen:wallet:bitcoin-cash')).toEqual('Second');
    });
    /** @target select @dependencies provider cleanup @scenario unmount during connect @expected cancellation and no late chain operation */
    it('cancels a pending BCH connection on unmount', async () => {
      const test = fixture();
      const wait = deferred();
      test.wallet.connect.mockImplementation(() => wait.promise);
      const selection = test.render().select(test.wallet);
      await vi.waitFor(() => expect(test.wallet.connect).toHaveBeenCalledTimes(1));
      test.unmount();
      wait.resolve();
      await selection;
      expect(test.wallet.disconnect).toHaveBeenCalledTimes(1);
      expect(test.wallet.switchChain).not.toHaveBeenCalled();
      expect([...test.storage]).toEqual([]);
    });
  });
  describe('disconnect', () => {
    /** @target disconnect @dependencies delayed disconnect and replacement wallet @scenario old disconnect settles after new selection @expected replacement remains connected */
    it('does not clear a newer selection when old disconnect finishes', async () => {
      const test = fixture();
      const wait = deferred();
      const second = test.createWallet('Second');
      await test.render().select(test.wallet);
      test.wallet.disconnect.mockImplementation(() => wait.promise);
      const old = test.render().disconnect();
      await vi.waitFor(() => expect(test.wallet.disconnect).toHaveBeenCalledTimes(1));
      await test.render().select(second);
      wait.resolve();
      await old;
      expect(test.render().selected).toEqual(second);
      expect(test.render().state).toEqual('CONNECTED');
      expect(test.storage.get('rosen:wallet:bitcoin-cash')).toEqual('Second');
    });
    /** @target disconnect @dependencies pending wallet connection @scenario disconnect before selection exists @expected late completion cannot connect */
    it('invalidates a pending selection before disconnecting', async () => {
      const test = fixture();
      const wait = deferred();
      test.wallet.connect.mockImplementation(() => wait.promise);
      const selection = test.render().select(test.wallet);
      await vi.waitFor(() => expect(test.wallet.connect).toHaveBeenCalledTimes(1));
      await test.render().disconnect();
      wait.resolve();
      await selection;
      expect(test.render().state).toEqual('DISCONNECTED');
      expect(test.render().selected).toEqual(undefined);
      expect(test.wallet.switchChain).not.toHaveBeenCalled();
    });
  });
  describe('startup restoration', () => {
    /** @target startup restoration @dependencies stored wallet and delayed isConnected @scenario source changes during restore @expected no stale connect or selection */
    it('discards stored-wallet restoration after changing source', async () => {
      const test = fixture();
      const wait = deferred();
      test.storage.set('rosen:wallet:bitcoin-cash', 'Cashonize');
      test.wallet.isConnected.mockImplementation(async () => {
        await wait.promise;
        return true;
      });
      test.render();
      await vi.waitFor(() => expect(test.wallet.isConnected).toHaveBeenCalledTimes(1));
      test.changeSource('ergo');
      test.render();
      wait.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(test.wallet.connect).not.toHaveBeenCalled();
      expect(test.render().selected).toEqual(undefined);
    });
  });
});
