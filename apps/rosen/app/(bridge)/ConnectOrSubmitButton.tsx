import { LoadingButton } from '@rosen-bridge/ui-kit';

import { useTransaction } from '@/_hooks/useTransaction';
import useTransactionFees from '@/_hooks/useTransactionFees';
import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useWallet from '@/_hooks/useWallet';

interface ConnectOrSubmitButtonProps {
  setChooseWalletsModalOpen: (open: boolean) => void;
}

export const ConnectOrSubmitButton = ({
  setChooseWalletsModalOpen,
}: ConnectOrSubmitButtonProps) => {
  const {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    formState: { isSubmitting: isFormSubmitting },
    handleSubmit,
  } = useTransactionFormData();

  const {
    networkFee,
    bridgeFee,
    isLoading: isLoadingFees,
  } = useTransactionFees(sourceValue, targetValue, tokenValue, amountValue);

  const { selectedWallet } = useWallet();

  const { startTransaction, isSubmitting: isTransactionSubmitting } =
    useTransaction();

  const handleFormSubmit = handleSubmit(() => {
    startTransaction(bridgeFee, networkFee);
  });

  return (
    <LoadingButton
      sx={{ width: '100%' }}
      color={selectedWallet ? 'success' : 'primary'}
      variant="contained"
      loading={isFormSubmitting || isTransactionSubmitting || isLoadingFees}
      type="submit"
      disabled={!sourceValue}
      onClick={() => {
        if (!selectedWallet) {
          setChooseWalletsModalOpen(true);
        } else {
          handleFormSubmit();
        }
      }}
    >
      {!selectedWallet ? 'CONNECT WALLET' : 'SUBMIT'}
    </LoadingButton>
  );
};
