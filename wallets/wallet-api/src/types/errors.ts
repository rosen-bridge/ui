import { Network } from '@rosen-ui/types';

export class AddressRetrievalError extends Error {
  constructor(public wallet: string) {
    super(`Failed to retrieve the address from the [${wallet}] wallet`);
  }
}

export class InteractionError extends Error {
  constructor(public wallet: string) {
    super(`Failed to interact with the [${wallet}] wallet`);
  }
}

export class UnsupportedChainError extends Error {
  constructor(
    public wallet: string,
    public chain: Network,
  ) {
    super(
      `The chain [${chain}] is not supported for switching in the [${wallet}] wallet`,
    );
  }
}

export class ChainSwitchingRejectedError extends Error {
  constructor(
    public wallet: string,
    public chain: Network,
    public cause: unknown,
  ) {
    super(
      `The request to switch to [${chain}] in the [${wallet}] wallet was rejected by the user`,
      { cause },
    );
  }
}

export class ChainNotAddedError extends Error {
  constructor(
    public wallet: string,
    public chain: Network,
    public cause: unknown,
  ) {
    super(
      `The chain [${chain}] has not been added to your [${wallet}] wallet. To proceed, please add it using the ${wallet} extension and try again`,
      { cause },
    );
  }
}

export class ConnectionRejectedError extends Error {
  constructor(
    public wallet: string,
    public cause: unknown,
  ) {
    super(`User rejected the connection request for the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class UserDeniedTransactionSignatureError extends Error {
  constructor(
    public wallet: string,
    public cause: unknown,
  ) {
    super(
      `Transaction signature denied by the user for the [${wallet}] wallet`,
      {
        cause,
      },
    );
  }
}
