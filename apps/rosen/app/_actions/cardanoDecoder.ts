'use server';

import {
  decodeWasmValue as valueDecoder,
  decodeAddr,
  decodeWasmUtxo,
} from '@rosen-ui/wallet-api';

import * as CardanoSerializationLib from '@emurgo/cardano-serialization-lib-nodejs';

export const decodeWasmValue = async (raw: string) =>
  valueDecoder(raw, CardanoSerializationLib);

export const decodeWasmAddress = async (raw: string) =>
  decodeAddr(raw, CardanoSerializationLib);

export const decodeWasmUtxos = async (raw: string) =>
  decodeWasmUtxo(raw, CardanoSerializationLib);
