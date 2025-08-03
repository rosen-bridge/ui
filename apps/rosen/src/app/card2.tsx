'use client';

import React, { forwardRef, HTMLAttributes, ReactNode } from 'react';

import { Box, styled } from '@mui/material';

type Card2Props = {
  clickable?: boolean;
  active?: boolean;
  backgroundColor?: string;
  variant?: 'separated';
} & HTMLAttributes<HTMLDivElement>;

export const Card2 = forwardRef<HTMLDivElement, Card2Props>(function Card2(
  { clickable, active, backgroundColor = 'white', children, variant, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      className={`card2 ${variant ? 'card2-' + variant : ''}`}
      sx={{
        backgroundColor: backgroundColor,
        borderRadius: (theme) => theme.spacing(2),
        cursor: clickable && 'pointer',
        position: 'relative',
        outline: (theme) => active && `3px solid ${theme.palette.primary.main}`,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

type Card2HeaderProps = {
  children?: ReactNode;
  action?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;
export const Card2Header = ({ children, title, action }: Card2HeaderProps) => {
  return (
    <Box
      className="card2-header"
      sx={{
        'display': 'flex',
        'alignItems': 'center',
        'borderRadius': (theme) => theme.spacing(2),
        'padding': (theme) => theme.spacing(2),
        '.card2-separated &': {
          position: 'relative',
        },
        '.card2-separated &:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
          borderBottom: (theme) => `1px dashed ${theme.palette.neutral.light}`,
        },
      }}
    >
      {/* <div>{title}</div> */}
      {<div style={{ flexGrow: 1 }}>{children}</div>}
      {action && <div>{action}</div>}
    </Box>
  );
};

type Card2TitleProps = {} & HTMLAttributes<HTMLDivElement>;
export const Card2Title = ({ children }: Card2TitleProps) => {
  return <Box>{children}</Box>;
};

type Card2BodyProps = {} & HTMLAttributes<HTMLDivElement>;
export const Card2Body = ({ children, style, ...rest }: Card2BodyProps) => {
  return (
    <Box
      className="card2-body"
      sx={{
        'padding': (theme) => theme.spacing(2),
        ...(style || {}),
        '.card2:not(.card2-separated) > .card2-header + &': {
          paddingTop: 0,
        },
        '&:has(+ .card2-header)': {
          paddingBottom: 0,
        },
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};
