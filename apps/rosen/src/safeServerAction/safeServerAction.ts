/* eslint-disable */
import { Schema } from 'joi';
import {
  addKnownErrorConstructor,
  serializeError,
  deserializeError,
} from 'serialize-error';

import { fromSafeData, toSafeData } from './safeData';

type AsyncFunction = (...args: any[]) => Promise<any>;

type CreateSafeActionConfig = {
  errors?: Record<string, new (...args: any[]) => Error>;
  deserializeError?: (error: any) => Error;
  serializeError?: (error: unknown) => any;
  onError?: (error: unknown, traceKey?: string, args?: any[]) => Promise<void>;
};

type WrapOptions = {
  cache?: number;
  schema?: Schema;
  traceKey?: string;
};

type Wrap = <Action extends AsyncFunction>(
  action: Action,
  options?: WrapOptions,
) => (...args: Parameters<Action>) => WrapResult<Action>;

type WrapResult<Action extends AsyncFunction> = Promise<{
  cache?: number;
  result?: Awaited<ReturnType<Action>>;
  serializedError?: any;
  traceKey?: string;
}>;

type Unwrap = <Action extends ReturnType<Wrap>>(
  action: Action,
) => (...args: Parameters<Action>) => UnwrapResult<Action>;

type UnwrapResult<Action extends ReturnType<Wrap>> = Promise<
  NonNullable<Awaited<ReturnType<Action>>['result']>
>;

type UnwrapFromObject = <T extends Record<string, ReturnType<Wrap>>>(
  obj: T,
) => {
  [K in keyof T]: (...args: Parameters<T[K]>) => UnwrapResult<T[K]>;
};

const DEFAULT_CONFIG: Partial<CreateSafeActionConfig> = {
  errors: {},
  deserializeError(error) {
    return deserializeError(error);
  },
  serializeError(error) {
    return serializeError(error);
  },
};

export const createSafeAction = (config: CreateSafeActionConfig) => {
  config = Object.assign({}, DEFAULT_CONFIG, config);

  const actions = new Map<Function, number>();

  const caches: Record<
    string,
    {
      cache?: number;
      initiated?: boolean;
      promise: Promise<Awaited<ReturnType<AsyncFunction>>>;
      timestamp?: number;
    }
  > = {};

  Object.keys(config.errors!).forEach((key) => {
    addKnownErrorConstructor(config.errors![key]);
  });

  const wrap: Wrap = (action, options) => {
    return async (...args) => {
      try {
        const validation = options?.schema?.validate(args);

        if (validation?.error) throw validation.error;

        return {
          cache: options?.cache,
          result: await toSafeData(action)(...args),
          traceKey: options?.traceKey,
        };
      } catch (error: unknown) {
        await config.onError?.(error, options?.traceKey, args);
        return {
          serializedError: config.serializeError!(error),
          traceKey: options?.traceKey,
        };
      }
    };
  };

  const unwrap: Unwrap = (action) => {
    if (!actions.has(action)) {
      actions.set(action, Math.random());
    }

    return async (...args) => {
      const key = [
        actions.get(action),
        ...args.map((arg) => {
          try {
            return JSON.stringify(arg);
          } catch {
            return arg.toString();
          }
        }),
      ].join('_');

      const handler = fromSafeData(action);

      const isInCache = key in caches;

      const isInitiated = caches[key]?.initiated;

      const isExpired =
        Date.now() >= (caches[key]?.timestamp || 0) + (caches[key]?.cache || 0);

      if (!isInCache || (isInitiated && isExpired)) {
        caches[key] = Object.assign({}, caches[key], {
          timestamp: Date.now(),
          promise: handler(...args),
        });
      }

      const unwrapResult = await caches[key].promise;

      if (unwrapResult.serializedError) {
        delete caches[key];

        const error = config.deserializeError!(unwrapResult.serializedError);

        await config.onError?.(error, unwrapResult.traceKey, args);

        throw error;
      }

      caches[key].cache = unwrapResult.cache;

      caches[key].initiated = true;

      return unwrapResult.result;
    };
  };

  const unwrapFromObject: UnwrapFromObject = (obj) => {
    const result = {} as any;

    for (const key in obj) {
      result[key] = unwrap(obj[key]);
    }

    return result;
  };

  return { wrap, unwrap, unwrapFromObject };
};
