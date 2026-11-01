import { fetcher } from '@rosen-ui/swr-helpers';

import { validateAddress } from '@/utils/validateAddress';

vi.mock('@rosen-ui/swr-helpers', () => ({
  fetcher: vi.fn(),
}));

const VALID_ERGO_ADDRESS = '9ec1CrJPSGcpcNHupv4TnqapPqvJaw6NWC5x21KxVDAtQYTCChT';

describe('validateAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @target validateAddress should return true when the Watcher API confirms a valid Ergo address
   * @dependencies
   * - fetcher
   * @scenario
   * - mock fetcher to resolve with `{ valid: true }`
   * - call validateAddress with a valid Ergo address
   * @expected
   * - fetcher should be called with `/address/validate/<address>`
   * - validateAddress should resolve to `true`
   */
  it('should return true when the Watcher API confirms a valid Ergo address', async () => {
    // arrange
    vi.mocked(fetcher).mockResolvedValueOnce({ valid: true });

    // act
    const result = await validateAddress(VALID_ERGO_ADDRESS);

    // assert
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(`/address/validate/${VALID_ERGO_ADDRESS}`);
    expect(result).toBe(true);
  });

  /**
   * @target validateAddress should trim surrounding whitespace and URL-encode special characters
   * @dependencies
   * - fetcher
   * @scenario
   * - mock fetcher to resolve with `{ valid: true }`
   * - call validateAddress with leading/trailing whitespace and URL-reserved characters
   * @expected
   * - fetcher should receive the trimmed, URL-encoded path segment
   * - validateAddress should resolve to `true`
   */
  it('should trim surrounding whitespace and URL-encode special characters', async () => {
    // arrange
    vi.mocked(fetcher).mockResolvedValueOnce({ valid: true });

    // act
    const result = await validateAddress('  addr/with?special#chars  ');

    // assert
    expect(fetcher).toHaveBeenCalledWith('/address/validate/addr%2Fwith%3Fspecial%23chars');
    expect(result).toBe(true);
  });

  /**
   * @target validateAddress should reject empty or whitespace-only values without calling the API
   * @dependencies
   * - fetcher
   * @scenario
   * - call validateAddress with an empty string and a whitespace-only string
   * @expected
   * - fetcher should not be called
   * - both calls should resolve to `'Address is required'`
   */
  it('should reject empty or whitespace-only values without calling the API', async () => {
    // act
    const emptyResult = await validateAddress('');
    const whitespaceResult = await validateAddress('   ');

    // assert
    expect(fetcher).not.toHaveBeenCalled();
    expect(emptyResult).toBe('Address is required');
    expect(whitespaceResult).toBe('Address is required');
  });

  /**
   * @target validateAddress should return `'Invalid Address'` when the API responds with `{ valid: false }`
   * @dependencies
   * - fetcher
   * @scenario
   * - mock fetcher to resolve with `{ valid: false }`
   * - call validateAddress with an invalid address
   * @expected
   * - validateAddress should resolve to `'Invalid Address'`
   */
  it('should return Invalid Address when the API responds with valid: false', async () => {
    // arrange
    vi.mocked(fetcher).mockResolvedValueOnce({ valid: false });

    // act
    const result = await validateAddress('invalid-ergo-address');

    // assert
    expect(result).toBe('Invalid Address');
  });

  /**
   * @target validateAddress should return `'Invalid Address'` when the Watcher API rejects an invalid address with HTTP 400 or 500
   * @dependencies
   * - fetcher
   * @scenario
   * - mock fetcher to reject with HTTP 500 (Watcher ApiError from address-codec) and HTTP 400
   * - call validateAddress for both responses
   * @expected
   * - both calls should resolve to `'Invalid Address'`
   */
  it('should return Invalid Address when the Watcher API rejects with HTTP 400 or 500', async () => {
    // arrange
    vi.mocked(fetcher)
      .mockRejectedValueOnce({ response: { status: 500, data: { message: 'Invalid base58' } } })
      .mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Address is required' } },
      });

    // act
    const result500 = await validateAddress('bad-checksum-address');
    const result400 = await validateAddress('malformed-address');

    // assert
    expect(result500).toBe('Invalid Address');
    expect(result400).toBe('Invalid Address');
  });

  /**
   * @target validateAddress should return the generic retry error when a network or gateway error occurs
   * @dependencies
   * - fetcher
   * @scenario
   * - mock fetcher to reject without a response (network error) and with HTTP 503 (gateway unavailable)
   * - call validateAddress for both failures
   * @expected
   * - both calls should resolve to `'Something went wrong! please try again'`
   */
  it('should return a retry message when a network or gateway error occurs', async () => {
    // arrange
    vi.mocked(fetcher)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockRejectedValueOnce({ response: { status: 503 } });

    // act
    const networkErrorResult = await validateAddress(VALID_ERGO_ADDRESS);
    const gatewayErrorResult = await validateAddress(VALID_ERGO_ADDRESS);

    // assert
    expect(networkErrorResult).toBe('Something went wrong! please try again');
    expect(gatewayErrorResult).toBe('Something went wrong! please try again');
  });
});
