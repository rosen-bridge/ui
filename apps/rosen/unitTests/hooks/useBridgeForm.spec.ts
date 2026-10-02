import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';

/** Hold one provider reply independently from the other validation stages. */
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
};

/** Execute the actual hook with controlled form, timer and provider boundaries. */
const fixture = () => {
  const values: Record<string, unknown> = {
    source: 'bitcoin-cash',
    target: 'ergo',
    token: { tokenId: 'bch', type: 'native', decimals: 0 },
    amount: '20',
    walletAddress: 'recipient',
  };
  const errors: Record<string, { type?: string; message?: string }> = {};
  const rules = new Map<string, { validate: (value: unknown) => Promise<string | undefined> }>();
  const writes: unknown[] = [];
  const wallet = {
    getBalance: vi.fn(async (..._args: unknown[]) => 100n),
    getAddress: vi.fn(async () => 'sender'),
  };
  const walletContext = { selected: wallet as typeof wallet | undefined };
  const source = {
    name: 'bitcoin-cash',
    getMaxTransfer: vi.fn(async (..._args: unknown[]) => 100n),
    getMinTransfer: vi.fn(async (..._args: unknown[]) => 1n),
  };
  const destination = {
    name: 'ergo',
    toSafeAddress: (value: string) => value,
    validateAddress: vi.fn(async (..._args: unknown[]) => true),
  };
  const slots: unknown[] = [];
  const pendingEffects: (() => void)[] = [];
  let slot = 0;
  const form = {
    control: {},
    formState: { errors },
    /** Read values at the asynchronous consumer's current boundary. */
    getValues: () => ({ ...values }),
    /** Replace the form as the actual source/target selection handlers do. */
    reset: (next: Record<string, unknown>) => {
      for (const key of Object.keys(values)) delete values[key];
      Object.assign(values, next);
      for (const key of Object.keys(errors)) delete errors[key];
    },
    resetField: vi.fn(),
    setFocus: vi.fn(),
    /** Preserve the input value and its dirty/touched options. */
    setValue: (name: string, value: unknown, options: unknown) => {
      values[name] = value;
      writes.push({ name, value, options });
    },
    /** Record pending or completed form errors. */
    setError: (name: string, error: { type?: string; message?: string }) => {
      errors[name] = error;
    },
    /** Model the form library's publication after an asynchronous validator resolves. */
    trigger: async (name: string) => {
      const message = await rules.get(name)!.validate(values[name]);
      if (message) errors[name] = { type: 'validate', message };
      else delete errors[name];
    },
  };
  const react = {
    useContext: () => walletContext,
    useCallback: (callback: unknown) => callback,
    /** Preserve refs across explicit renders. */
    useRef: (initial: unknown) => {
      const index = slot++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    /** Preserve state slots while exposing callback-driven writes. */
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
    /** Apply dependency cleanup before mounting replacement effects. */
    useEffect: (effect: () => (() => void) | undefined, dependencies: unknown[]) => {
      const index = slot++;
      const previous = slots[index] as
        | { dependencies: unknown[]; cleanup?: () => void }
        | undefined;
      if (!previous || dependencies.some((value, i) => value !== previous.dependencies[i])) {
        pendingEffects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  };
  const exports = {} as {
    useBridgeForm: () => {
      reset: typeof form.reset;
      handleAmountChange: (value: string, immediate?: boolean) => void;
      handleAddressChange: (value: string, immediate?: boolean) => void;
      isAmountValidating: boolean;
    };
  };
  const compiled = ts.transpileModule(
    readFileSync(new URL('../../src/hooks/useBridgeForm.ts', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  runInNewContext(compiled, {
    exports,
    setTimeout,
    clearTimeout,
    console,
    /** Restrict imports to the direct hook's declared fixture ports. */
    require: (id: string) => {
      if (id === 'react') return react;
      if (id === 'react-hook-form')
        return {
          useFormContext: () => form,
          /** Register the current source validator without replacing its implementation. */
          useController: ({ name, rules: rule }: { name: string; rules?: unknown }) => {
            if (rule)
              rules.set(
                name,
                rule as { validate: (value: unknown) => Promise<string | undefined> },
              );
            return { field: { value: values[name] } };
          },
        };
      if (id === '@rosen-ui/utils') return { getNonDecimalString: (value: string) => value };
      if (id === '@/networks') return { default: { source, destination } };
      if (id === '../../configs') return { FEE_CONFIG_TOKEN_ID: 'fixture-fee' };
      if (id === './useTokenMap')
        return { useTokenMap: () => ({ getSignificantDecimals: () => 0 }) };
      if (id === './useTransactionFormData') return { useTransactionFormData: () => form };
      if (id === './useWallet') return { WalletContext: {} };
      throw new Error(`Unexpected hook import: ${id}`);
    },
  });
  /** Render current controller values and flush actual hook effect cleanup. */
  const render = () => {
    slot = 0;
    const hook = exports.useBridgeForm();
    for (const effect of pendingEffects.splice(0)) effect();
    return hook;
  };
  render();
  return {
    values,
    errors,
    writes,
    wallet,
    walletContext,
    source,
    destination,
    form,
    render,
    /** Invoke the actual currently registered asynchronous field validator. */
    validate: (name: string) => rules.get(name)!.validate(values[name]),
    /** Revoke the effects without mounting a replacement form. */
    unmount: () => {
      for (const value of slots) (value as { cleanup?: () => void } | undefined)?.cleanup?.();
    },
  };
};

afterEach(() => vi.useRealTimers());

describe('useBridgeForm', () => {
  describe('amountField.validate', () => {
    /** @target amountField.validate accepts a valid current native amount @dependencies current form and provider ports @scenario valid native amount @expected exact current maximum/minimum inputs and no error */
    it('accepts a valid current amount with the current recipient', async () => {
      const test = fixture();
      expect(await test.validate('amount')).toEqual(undefined);
      expect(test.source.getMaxTransfer).toHaveBeenCalledWith({
        balance: 100n,
        isNative: true,
        eventData: { fromAddress: 'sender', toAddress: 'recipient', toChain: 'ergo' },
      });
      expect(test.source.getMinTransfer).toHaveBeenCalledWith(
        expect.objectContaining({ tokenId: 'bch' }),
        'ergo',
        'fixture-fee',
      );
    });

    /** @target amountField.validate discards an obsolete amount reply at each asynchronous boundary @dependencies held balance/address/max/min ports @scenario amount changes after one isolated await @expected stale reply is discarded and later stages do not run */
    it.each(['balance', 'address', 'max', 'min'] as const)(
      'discards a reply from the previous amount at the %s boundary',
      async (stage) => {
        const test = fixture();
        const hold = deferred<bigint | string>();
        if (stage === 'balance')
          test.wallet.getBalance.mockImplementationOnce(
            async () => hold.promise as Promise<bigint>,
          );
        if (stage === 'address')
          test.wallet.getAddress.mockImplementationOnce(
            async () => hold.promise as Promise<string>,
          );
        if (stage === 'max')
          test.source.getMaxTransfer.mockImplementationOnce(
            async () => hold.promise as Promise<bigint>,
          );
        if (stage === 'min')
          test.source.getMinTransfer.mockImplementationOnce(
            async () => hold.promise as Promise<bigint>,
          );
        const result = test.validate('amount');
        const provider =
          stage === 'balance'
            ? test.wallet.getBalance
            : stage === 'address'
              ? test.wallet.getAddress
              : stage === 'max'
                ? test.source.getMaxTransfer
                : test.source.getMinTransfer;
        await vi.waitFor(() => expect(provider).toHaveBeenCalledTimes(1));
        test.values.amount = '21';
        test.render();
        hold.resolve(stage === 'address' ? 'old-sender' : stage === 'min' ? 100n : 0n);
        expect(await result).toEqual('Please check this field again.');
        if (stage === 'balance') expect(test.wallet.getAddress).not.toHaveBeenCalled();
        if (stage === 'balance' || stage === 'address')
          expect(test.source.getMaxTransfer).not.toHaveBeenCalled();
        if (stage !== 'min') expect(test.source.getMinTransfer).not.toHaveBeenCalled();
      },
    );

    /** @target amountField.validate discards minimum replies after a relevant context field changes @dependencies held minimum reply @scenario one source/target/token/address/wallet input changes @expected obsolete minimum verdict is not published */
    it.each([
      'source',
      'target',
      'token',
      'tokenId',
      'tokenType',
      'tokenDecimals',
      'walletAddress',
      'wallet',
    ] as const)('discards an obsolete minimum after changing %s', async (field) => {
      const test = fixture();
      const hold = deferred<bigint>();
      test.source.getMinTransfer.mockImplementationOnce(async () => hold.promise);
      const result = test.validate('amount');
      await vi.waitFor(() => expect(test.source.getMinTransfer).toHaveBeenCalledTimes(1));
      if (field === 'source') test.values.source = 'other';
      if (field === 'target') test.values.target = 'cardano';
      if (field === 'token') test.values.token = { ...(test.values.token as object) };
      if (field === 'tokenId') (test.values.token as { tokenId: string }).tokenId = 'other';
      if (field === 'tokenType') (test.values.token as { type: string }).type = 'token';
      if (field === 'tokenDecimals') (test.values.token as { decimals: number }).decimals = 8;
      if (field === 'walletAddress') test.values.walletAddress = 'other-recipient';
      if (field === 'wallet') test.walletContext.selected = { ...test.wallet };
      test.render();
      hold.resolve(100n);
      expect(await result).toEqual('Please check this field again.');
    });

    /** @target amountField.validate clears an obsolete minimum verdict after an empty reset @dependencies held minimum reply @scenario reset clears the selected asset and amount @expected late minimum error leaves the reset field clear */
    it('clears the old verdict when the form has reset to empty values', async () => {
      const test = fixture();
      const hold = deferred<bigint>();
      test.source.getMinTransfer.mockImplementationOnce(async () => hold.promise);
      const result = test.validate('amount');
      await vi.waitFor(() => expect(test.source.getMinTransfer).toHaveBeenCalledTimes(1));
      test.render().reset({
        source: 'bitcoin-cash',
        target: 'cardano',
        token: null,
        amount: '',
        walletAddress: '',
      });
      test.render();
      hold.resolve(100n);
      expect(await result).toEqual(undefined);
    });

    /** @target amountField.validate revokes responses after identical resets or unmount @dependencies held minimum reply @scenario reset restores identical values or owner unmounts @expected previous response remains revoked */
    it.each(['reset', 'unmount'] as const)('revokes a held response on %s', async (action) => {
      const test = fixture();
      const hold = deferred<bigint>();
      test.source.getMinTransfer.mockImplementationOnce(async () => hold.promise);
      const result = test.validate('amount');
      await vi.waitFor(() => expect(test.source.getMinTransfer).toHaveBeenCalledTimes(1));
      if (action === 'reset') {
        test.render().reset({ ...test.values });
        test.render();
      } else test.unmount();
      hold.resolve(100n);
      expect(await result).toEqual(
        action === 'reset' ? 'Please check this field again.' : undefined,
      );
    });

    /** @target amountField.validate distinguishes current provider failures from obsolete rejections @dependencies rejecting minimum provider @scenario current or obsolete rejection @expected current failure stays visible; obsolete failure is replaced */
    it.each([false, true])('handles a rejection with changed=%s', async (changed) => {
      const test = fixture();
      const hold = deferred<bigint>();
      test.source.getMinTransfer.mockImplementationOnce(async () => hold.promise);
      const result = test.validate('amount');
      await vi.waitFor(() => expect(test.source.getMinTransfer).toHaveBeenCalledTimes(1));
      if (changed) {
        test.values.amount = '21';
        test.render();
      }
      hold.reject(new Error('held provider failed'));
      expect(await result).toEqual(
        changed ? 'Please check this field again.' : 'Something went wrong! please try again',
      );
    });
  });

  describe('addressField.validate', () => {
    /** @target addressField.validate preserves current positive and negative address decisions @dependencies destination validator @scenario current positive and negative answers @expected current address decision is preserved */
    it.each([true, false])('retains a current address decision valid=%s', async (valid) => {
      const test = fixture();
      test.destination.validateAddress.mockResolvedValueOnce(valid);
      expect(await test.validate('walletAddress')).toEqual(valid ? undefined : 'Invalid Address');
    });

    /** @target addressField.validate discards address replies after destination or recipient changes @dependencies held destination validator @scenario destination or recipient changes during validation @expected previous address decision is not published */
    it.each(['target', 'walletAddress'] as const)(
      'discards a stale address decision after %s changes',
      async (field) => {
        const test = fixture();
        const hold = deferred<boolean>();
        test.destination.validateAddress.mockImplementationOnce(async () => hold.promise);
        const result = test.validate('walletAddress');
        test.values[field] = 'other';
        test.render();
        hold.resolve(false);
        expect(await result).toEqual('Please check this field again.');
      },
    );

    /** @target addressField.validate clears a late rejected check after an empty reset @dependencies rejecting destination validator @scenario reset empties the recipient while its request fails @expected no obsolete error is restored */
    it('clears a late rejected address check after a reset', async () => {
      const test = fixture();
      const hold = deferred<boolean>();
      test.destination.validateAddress.mockImplementationOnce(async () => hold.promise);
      const result = test.validate('walletAddress');
      test.render().reset({ ...test.values, target: 'cardano', walletAddress: '' });
      test.render();
      hold.reject(new Error('old address provider failed'));
      expect(await result).toEqual(undefined);
    });

    /** @target addressField.validate revokes replies after identical resets or unmount @dependencies held destination validator @scenario reset restores the same recipient or the owner unmounts @expected previous address verdict remains revoked */
    it.each(['reset', 'unmount'] as const)('revokes a held address reply on %s', async (action) => {
      const test = fixture();
      const hold = deferred<boolean>();
      test.destination.validateAddress.mockImplementationOnce(async () => hold.promise);
      const result = test.validate('walletAddress');
      if (action === 'reset') {
        test.render().reset({ ...test.values });
        test.render();
      } else test.unmount();
      hold.resolve(false);
      expect(await result).toEqual(
        action === 'reset' ? 'Please check this field again.' : undefined,
      );
    });
  });

  describe('useDebouncedValidation', () => {
    /** @target handleAmountChange preserves immediate paste/max input validation @dependencies actual debounce and controlled form @scenario paste/max input is validated immediately @expected trimming, dirty/touched state and validation are retained */
    it('preserves immediate input behavior and clears the spinner after validation', async () => {
      vi.useFakeTimers();
      const test = fixture();
      test.render().handleAmountChange(' 20 ', true);
      expect(test.values.amount).toEqual('20');
      expect(test.writes).toEqual([
        { name: 'amount', value: '20', options: { shouldDirty: true, shouldTouch: true } },
      ]);
      await vi.advanceTimersByTimeAsync(501);
      expect(test.source.getMinTransfer).toHaveBeenCalledTimes(1);
      expect(test.errors.amount).toEqual(undefined);
      expect(test.render().isAmountValidating).toEqual(false);
    });

    /** @target useDebouncedValidation cancels queued work after reset or unmount @dependencies pending timer @scenario owner resets or unmounts before delayed validation @expected cancelled callback makes no provider calls */
    it.each(['reset', 'unmount'] as const)('cancels queued validation on %s', async (action) => {
      vi.useFakeTimers();
      const test = fixture();
      test.render().handleAmountChange('20');
      if (action === 'reset') {
        test.render().reset({ ...test.values, token: null, amount: '' });
        test.render();
      } else test.unmount();
      await vi.advanceTimersByTimeAsync(2000);
      expect(test.source.getMinTransfer).not.toHaveBeenCalled();
      expect(test.wallet.getBalance).not.toHaveBeenCalled();
    });

    /** @target handleAddressChange revokes address replies after typing away and back @dependencies held address validator and input revision @scenario recipient input returns to the original string @expected the first response remains revoked */
    it('revokes the first address check after typing away and back', async () => {
      vi.useFakeTimers();
      const test = fixture();
      const hold = deferred<boolean>();
      test.destination.validateAddress.mockImplementationOnce(async () => hold.promise);
      const result = test.validate('walletAddress');
      test.render().handleAddressChange('other');
      test.render().handleAddressChange('recipient');
      hold.resolve(false);
      expect(await result).toEqual('Please check this field again.');
      test.unmount();
    });
  });
});
