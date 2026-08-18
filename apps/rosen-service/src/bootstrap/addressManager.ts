import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { chainDecoders, chainValidators } from '@rosen-bridge/address-codec';
import { AddressManager } from '@rosen-bridge/address-manager';

AddressManager.init(
  chainValidators,
  chainDecoders,
  DefaultLogger.getInstance().child('addressManager'),
);
