import { Network } from '@rosen-ui/types';

export class AddressRetrievalError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`Failed to retrieve the address from the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class InteractionError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`Failed to interact with the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class UnsupportedChainError extends Error {
  constructor(
    public wallet: string,
    public chain: Network,
    public cause?: unknown,
  ) {
    super(
      `The chain [${chain}] is not supported for switching in the [${wallet}] wallet`,
      {
        cause,
      },
    );
  }
}

export class UnavailableApiError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`The [${wallet}] wallet API is not available.`, {
      cause,
    });
  }
}

export class ChainSwitchingRejectedError extends Error {
  constructor(
    public wallet: string,
    public chain: Network,
    public cause?: unknown,
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
    public cause?: unknown,
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
    public cause?: unknown,
  ) {
    super(`User rejected the connection request for the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class ConnectionTimeoutError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(
      `The wallet [${wallet}] extension has timed out, and the user has neither confirmed nor rejected it`,
      {
        cause,
      },
    );
  }
}

export class DisconnectionFailedError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`An error occurred while disconnecting from the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class UserDeniedTransactionSignatureError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(
      `Transaction signature denied by the user for the [${wallet}] wallet`,
      {
        cause,
      },
    );
  }
}

export class BalanceFetchError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`Failed to fetch wallet balance from the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class UtxoFetchError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`Failed to fetch wallet UTXOs from the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class CurrentChainError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`Can not detect current chain from the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class SubmitTransactionError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`Transaction failed for the [${wallet}] wallet`, {
      cause,
    });
  }
}

export class NotConnectedError extends Error {
  constructor(
    public wallet: string,
    public cause?: unknown,
  ) {
    super(`Wallet connection required for the [${wallet}] wallet`, {
      cause,
    });
  }
}
