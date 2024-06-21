import { SwipeableDrawer } from '@rosen-bridge/ui-kit';
import { useEffect, useState } from 'react';
import useSWRMutation from 'swr/mutation';

import { ApiAssetResponse } from '@/_types/api';

interface DetailsDrawerProps {
  id: string;
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const DetailsDrawer = ({
  id,
  open,
  onClose,
  onOpen,
}: DetailsDrawerProps) => {
  const [data, setData] = useState<ApiAssetResponse>();

  const { isMutating, trigger } = useSWRMutation(
    `/api/v1/assets/detail/${id}`,
    (url) => fetch(url, { method: 'GET' }).then((res) => res.json()),
  );

  useEffect(() => {
    if (!id || !open) return;
    trigger().then(setData);
  }, [id, open, trigger]);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
    ></SwipeableDrawer>
  );
};
