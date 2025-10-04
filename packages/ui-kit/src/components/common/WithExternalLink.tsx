import { ReactNode } from 'react';

import { ExternalLinkAlt } from '@rosen-bridge/icons';

import { Link, StackMui, SvgIcon } from '../base';

export interface WithExternalLinkProps {
  children: ReactNode;
  url?: string | null;
}

/**
 * renders a link alongside its corresponding child element
 *
 * @param children
 * @param url
 */
export const WithExternalLink = ({ children, url }: WithExternalLinkProps) => {
  return (
    <StackMui alignItems="center" direction="row" gap={1}>
      <span>{children}</span>
      {url && (
        <Link
          href={url}
          target="_blank"
          onClick={(event) => event.stopPropagation()}
        >
          <SvgIcon fontSize="inherit" sx={{ display: 'block' }}>
            <ExternalLinkAlt />
          </SvgIcon>
        </Link>
      )}
    </StackMui>
  );
};
