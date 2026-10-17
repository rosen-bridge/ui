import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  started: [] as string[],
  bitcoinCash: vi.fn(),
  handleError: vi.fn(),
  logger: { child: vi.fn(), debug: vi.fn() },
}));
/** Record an inert legacy scanner start and expose its unchanged identity. */
const legacy = async (name: string) => {
  mocks.started.push(name);
  return { name: () => name };
};
vi.mock('@rosen-bridge/abstract-logger', () => ({
  DefaultLogger: { getInstance: () => mocks.logger },
}));
vi.mock('../../src/utils', () => ({ handleError: mocks.handleError }));
vi.mock('../../src/scanner/chains/bitcoin-cash', () => ({
  startBitcoinCashScanner: mocks.bitcoinCash,
}));
vi.mock('../../src/scanner/chains/ergo', () => ({ startErgoScanner: () => legacy('ergo') }));
vi.mock('../../src/scanner/chains/cardano', () => ({
  startCardanoScanner: () => legacy('cardano'),
}));
vi.mock('../../src/scanner/chains/bitcoin', () => ({
  startBitcoinScanner: () => legacy('bitcoin'),
}));
vi.mock('../../src/scanner/chains/ethereum', () => ({
  startEthereumScanner: () => legacy('ethereum'),
}));
vi.mock('../../src/scanner/chains/binance', () => ({
  startBinanceScanner: () => legacy('binance'),
}));
vi.mock('../../src/scanner/chains/doge', () => ({ startDogeScanner: () => legacy('doge') }));
vi.mock('../../src/scanner/chains/firo', () => ({ startFiroScanner: () => legacy('firo') }));
vi.mock('../../src/scanner/chains/handshake', () => ({
  startHandshakeScanner: () => legacy('handshake'),
}));

describe('scannerService', () => {
  describe('start', () => {
    beforeEach(() => {
      vi.resetModules();
      vi.clearAllMocks();
      mocks.started.length = 0;
      mocks.logger.child.mockReturnValue(mocks.logger);
      mocks.bitcoinCash.mockResolvedValue(undefined);
    });

    /**
     * @target scannerService.start preserves all existing scanner starts while
     * BCH is absent
     * @dependencies Mock chain starts and logger; real scanner-service orchestration.
     * @scenario Start the service when the optional BCH factory returns undefined.
     * @expected Existing order and getters remain, with no BCH name in the startup log.
     */
    it('preserves all existing scanner starts while BCH is absent', async () => {
      const { default: service } = await import('../../src/scanner/scanner-service');
      await service.start();
      expect(mocks.started).toEqual([
        'ergo',
        'cardano',
        'bitcoin',
        'ethereum',
        'binance',
        'doge',
        'firo',
        'handshake',
      ]);
      expect(service.getBitcoinScanner().name()).toEqual('bitcoin');
      expect(service.getErgoScanner().name()).toEqual('ergo');
      expect(service.getBitcoinCashScanner()).toBeUndefined();
      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.any(String), {
        scannerNames: mocks.started,
      });
    });

    /**
     * @target scannerService.start adds the BCH lifecycle without replacing
     * Bitcoin
     * @dependencies Mock BCH factory and existing chain starts.
     * @scenario Return an initialized BCH scanner without replacing a Bitcoin scanner.
     * @expected Separate BCH getter and log entry with all eight previous scanners intact.
     */
    it('adds the BCH lifecycle without replacing Bitcoin', async () => {
      const bitcoinCash = { name: () => 'bitcoin-cash' };
      mocks.bitcoinCash.mockResolvedValue(bitcoinCash);
      const { default: service } = await import('../../src/scanner/scanner-service');
      await service.start();
      expect(service.getBitcoinCashScanner()).toBe(bitcoinCash);
      expect(service.getBitcoinScanner().name()).toEqual('bitcoin');
      expect(mocks.logger.debug).toHaveBeenCalledWith(expect.any(String), {
        scannerNames: [...mocks.started, 'bitcoin-cash'],
      });
    });

    /**
     * @target scannerService.start forwards BCH startup failure without
     * claiming successful startup
     * @dependencies Mock rejected BCH factory and fatal handler.
     * @scenario Reject BCH startup before initialized scanner state is assigned.
     * @expected Forward the failure to the existing handler and leave BCH unavailable.
     */
    it('forwards BCH startup failure without claiming successful startup', async () => {
      const failure = new Error('BCH scanner initialization failed');
      mocks.bitcoinCash.mockRejectedValueOnce(failure);
      const { default: service } = await import('../../src/scanner/scanner-service');
      await service.start();
      expect(mocks.handleError).toHaveBeenCalledWith(failure, mocks.logger);
      expect(service.getBitcoinCashScanner()).toBeUndefined();
      expect(mocks.logger.debug).not.toHaveBeenCalled();
    });
  });
});
