import useNetwork from './useNetwork';

/**
 * return the lock address for currently selected network
 */
const useLockAddress = () => {
  const { selectedNetwork } = useNetwork();

  return selectedNetwork?.lockAddress ?? '';
};

export default useLockAddress;
