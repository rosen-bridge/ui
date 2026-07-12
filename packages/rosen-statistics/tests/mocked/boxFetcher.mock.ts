import { vi } from 'vitest';

import * as Services from '../../lib/fetchers';

const mockFetchUnspentBoxes = vi.fn();

const RealNode = Services.NodeBoxFetcher;

/**
 * Mocks `NodeBoxFetcher` instances created in tests by replacing
 * `fetchUnspentBoxesByTokenId` with a mocked implementation that
 * resolves to the provided return value.
 *
 * @param returnValue mocked response for `fetchUnspentBoxesByTokenId`
 */
// biome-ignore lint/suspicious/noExplicitAny: Use a better type
export const setupNodeMock = (returnValue: any) => {
  if (returnValue instanceof Error) {
    mockFetchUnspentBoxes.mockRejectedValue(returnValue);
  } else {
    mockFetchUnspentBoxes.mockResolvedValue(returnValue);
  }
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
