import { vi } from 'vitest';

import * as Services from '../../lib/services';

const mockFetchUnspentBoxes = vi.fn();

const RealExplorer = Services.ExplorerBoxFetcher;
const RealNode = Services.NodeBoxFetcher;

/**
 * Mocks `ExplorerBoxFetcher` instances created in tests by replacing
 * `fetchUnspentBoxesByTokenId` with a mocked implementation that
 * resolves to the provided return value.
 *
 * @param returnValue mocked response for `fetchUnspentBoxesByTokenId`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupExplorerMock = (returnValue: any) => {
  mockFetchUnspentBoxes.mockResolvedValue(returnValue);

  vi.spyOn(Services, 'ExplorerBoxFetcher').mockImplementation(
    (...args: ConstructorParameters<typeof RealExplorer>) => {
      const instance = new RealExplorer(...args);

      vi.spyOn(instance, 'fetchUnspentBoxesByTokenId').mockImplementation(
        mockFetchUnspentBoxes,
      );

      return instance;
    },
  );
};

/**
 * Mocks `NodeBoxFetcher` instances created in tests by replacing
 * `fetchUnspentBoxesByTokenId` with a mocked implementation that
 * resolves to the provided return value.
 *
 * @param returnValue mocked response for `fetchUnspentBoxesByTokenId`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupNodeMock = (returnValue: any) => {
  mockFetchUnspentBoxes.mockResolvedValue(returnValue);

  vi.spyOn(Services, 'NodeBoxFetcher').mockImplementation(
    (...args: ConstructorParameters<typeof RealNode>) => {
      const instance = new RealNode(...args);

      vi.spyOn(instance, 'fetchUnspentBoxesByTokenId').mockImplementation(
        mockFetchUnspentBoxes,
      );

      return instance;
    },
  );
};

/**
 * Resets all mocks and restores original implementations.
 */
export const resetMocks = () => {
  mockFetchUnspentBoxes.mockReset();
  vi.restoreAllMocks();
};
