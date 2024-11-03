import { Schema } from 'joi';
import {
  errorConstructors,
  serializeError,
  deserializeError,
} from 'serialize-error';

import { fromSafeData, toSafeData } from './safeData';

type AsyncFunction = (...args: any[]) => Promise<any>;

type CreateSafeActionConfig = {
  errors?: {
    [key: string]: ErrorConstructor;
  };
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
    errorConstructors.set(key, config.errors![key]);
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
    return async (...args) => {
      const key = args.map((arg) => arg.toString()).join('_');

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

      caches[key].cache = unwrapResult.cache;
      caches[key].initiated = true;

      if (unwrapResult.serializedError) {
        delete caches[key];

        const error = config.deserializeError!(unwrapResult.serializedError);

        await config.onError?.(error, unwrapResult.traceKey, args);

        throw error;
      }

      return unwrapResult.result;
    };
  };

  return { wrap, unwrap };
};
