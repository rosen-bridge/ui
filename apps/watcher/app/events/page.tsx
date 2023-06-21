'use client';

export function generateStaticParams() {
  return [{ slug: ['1'] }, { slug: ['2'] }, { slug: ['3'] }];
}

/**
 * TODO: Implement component as part of #9
 * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/9
 */
const Events = () => null;

export default Events;
