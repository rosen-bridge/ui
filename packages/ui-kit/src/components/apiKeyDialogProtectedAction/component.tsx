import { cloneElement, type ReactElement } from 'react';

import { Tooltip } from '@/components';
import { useApiKey, useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface ApiKeyDialogProtectedActionOverrides {}

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
