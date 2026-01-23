'use client';

import { CircularProgress, Typography } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getDecimalString } from '@rosen-ui/utils';
import useSWR from 'swr';

import { useRsnToken, useToken } from '@/hooks';
import { ApiInfoResponse } from '@/types/api';

import { ActionText } from '../../ActionText';

const LockText = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );
  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');
  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();

  const rwtPerRsn = 10 ** (rsnToken?.decimals ?? 0);
  const requiredRSN = (info?.permitsPerEvent ?? 0) / rwtPerRsn;

  return (
    <ActionText title="Lock & Get Permit">
      <Typography gutterBottom>
        To activate a watcher, there is a need for some collateral that is fully
        refundable and safe. On top of that, you&apos;ll need reporting permits
        to report each event. These reporting permits are at risk of seizure in
        case of fraudulent reports. Otherwise, they will be returned back to you
        along with your reporting rewards.
      </Typography>

      {info && !info.permitCount.total && (
        <>
          <Typography fontWeight="bold" sx={{ mt: 2 }}>
            Collateral
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Currently, the required collateral is{' '}
            {isInfoLoading || isErgTokenLoading ? (
              <CircularProgress size={12} />
            ) : (
              getDecimalString(
                info.collateral.erg.toString(),
                ergToken?.decimals ?? 0,
              )
            )}{' '}
            ERG and{' '}
            {isInfoLoading || isRsnTokenLoading ? (
              <CircularProgress size={12} />
            ) : (
              getDecimalString(
                info.collateral.rsn.toString(),
                rsnToken?.decimals ?? 0,
              )
            )}{' '}
            RSN. It is a <b>one-time</b> payment for registering as a watcher an
            getting a WID. This collateral is fully refundable with redeeming
            all of your locked RSN.
          </Typography>
        </>
      )}

      <Typography fontWeight="bold" sx={{ mt: 2 }}>
        RSN
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Currently, you should lock{' '}
        {isInfoLoading || isRsnTokenLoading ? (
          <CircularProgress size={12} />
        ) : (
          requiredRSN
        )}{' '}
        RSN to report an event.
      </Typography>
    </ActionText>
  );
};

export default LockText;
