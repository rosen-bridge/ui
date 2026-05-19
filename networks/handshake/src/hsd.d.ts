declare module 'hsd' {
  export class MTX {
    inputs: Input[];
    outputs: Output[];
    version: number;
    locktime: number;

    constructor();
    addCoin(coin: Coin): void;
    addOutput(options: { address: Address; value: number }): void;
    txid(): string;
    signatureHash(index: number): Buffer;
    toRaw(): Buffer;
    toHex(): string;
    static fromRaw(data: Buffer): MTX;
    static fromHex(hex: string): MTX;
  }

  export class TX {
    inputs: Input[];
    outputs: Output[];
    static fromRaw(data: Buffer): TX;
    static fromHex(hex: string): TX;
  }

  export class Input {
    prevout: Outpoint;
    witness: Witness;

    constructor();
  }

  export class Output {
    value: number;
    address: Address;
    covenant: Covenant;
    getAddress(): Address | null;
  }

  export class Outpoint {
    hash: Buffer;
    index: number;
    rhash(): string;
  }

  export class Witness {
    fromStack(stack: Buffer[]): void;
  }

  export class Address {
    static fromString(address: string): Address;
    toString(): string;
    getHash(): Buffer;
  }

  export class Script {
    constructor();
    pushData(data: Buffer): void;
    compile(): void;
    toStack(): Buffer[];
  }

  export class Coin {
    static fromJSON(options: {
      version: number;
      height: number;
      value: number;
      address: string;
      coinbase: boolean;
      hash: string;
      index: number;
    }): Coin;
  }

  export class Covenant {
    static fromNullData(data: Buffer): Covenant;
    type: number;
  }
}
