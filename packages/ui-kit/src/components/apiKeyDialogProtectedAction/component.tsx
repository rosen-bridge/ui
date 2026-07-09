import { cloneElement, ReactElement } from 'react';

import { Tooltip } from '@/components';
import { useApiKey, useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiKeyDialogProtectedActionOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ApiKeyDialogProtectedActionOwnProps = {};

export type ApiKeyDialogProtectedActionBaseProps = ElementBaseProps<
  typeof Tooltip,
  ApiKeyDialogProtectedActionOwnProps
>;

export type ApiKeyDialogProtectedActionProps = OverridableType<
  ApiKeyDialogProtectedActionBaseProps,
  ApiKeyDialogProtectedActionOverrides,
  never
>;

export const ApiKeyDialogProtectedAction = (
  props: ApiKeyDialogProtectedActionProps,
) => {
  const { children, ...rest } = useConfig('ApiKeyDialogProtectedAction', props);

  const { apiKey } = useApiKey();

  if (apiKey) return children;

  const child = children as ReactElement<Record<string, unknown>>;

  return (
    <Tooltip title="API key is required to perform this action" {...rest}>
      <span>{cloneElement(child, { disabled: true })}</span>
    </Tooltip>
  );
};

ApiKeyDialogProtectedAction.displayName = 'ApiKeyDialogProtectedAction';
