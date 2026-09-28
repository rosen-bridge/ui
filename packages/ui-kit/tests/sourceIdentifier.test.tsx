import { createElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  MobileRow as EventMobileRow,
  TabletRow as EventTabletRow,
} from '../../../apps/watcher/src/app/events/TableRow';
import {
  MobileRow as ObservationMobileRow,
  TabletRow as ObservationTabletRow,
} from '../../../apps/watcher/src/app/observations/TableRow';
import { EventDetails } from '../dist/index.js';
import { getSourceIdentifier } from '../src/utils/sourceIdentifier';

const renderState = vi.hoisted(() => ({ expandNext: false }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    // Start the actual mobile component in its expanded state for server rendering.
    // All other hooks and every source-value/link component remain real.
    useState: (initial: unknown) => {
      const expanded = renderState.expandNext && initial === false;
      if (expanded) renderState.expandNext = false;
      return actual.useState(expanded ? true : initial);
    },
  };
});

const reference = `box:${'ab'.repeat(32)}.2`;
const addressUrl = 'https://explorer.example/address/should-not-be-linked';

describe('source identifier presentation', () => {
  // Existing layout utilities use Option.style to recognize CSS units. This
  // DOM-only detail is not part of the source-value/link rendering assertions.
  beforeAll(() =>
    vi.stubGlobal(
      'Option',
      class {
        style = { width: '' };
      },
    ),
  );
  afterAll(() => vi.unstubAllGlobals());
  it('recognizes only a canonical Zcash outpoint, retaining the wire value', () => {
    expect(getSourceIdentifier('zcash', reference, addressUrl)).toMatchObject({
      inputReference: true,
      label: 'Input reference',
      href: undefined,
    });
    for (const value of [
      `box:${'ab'.repeat(32)}.01`,
      `box:${'ab'.repeat(32)}.4294967296`,
      'box:invalid.0',
    ]) {
      expect(getSourceIdentifier('zcash', value).inputReference).toBe(false);
    }
    expect(getSourceIdentifier('ergo', reference, addressUrl).href).toBe(addressUrl);
    expect(getSourceIdentifier('monero', reference, addressUrl).inputReference).toBe(false);
  });

  it('renders the actual shared details component without an address link for a Zcash input', () => {
    const html = renderToStaticMarkup(
      createElement(EventDetails, {
        value: {
          fromChain: 'zcash',
          fromAddress: reference,
          fromAddressUrl: addressUrl,
          toAddress: 'recipient',
        },
      }),
    );
    expect(html).toContain('Input reference');
    expect(html).toContain('not a sender address');
    expect(html).toContain(reference);
    expect(html).not.toContain(addressUrl);
  });

  it('preserves address links for existing chains', () => {
    const html = renderToStaticMarkup(
      createElement(EventDetails, {
        value: {
          fromChain: 'ergo',
          fromAddress: 'sender',
          fromAddressUrl: addressUrl,
          toAddress: 'recipient',
        },
      }),
    );
    expect(html).toContain(addressUrl);
    expect(html).not.toContain('Input reference');
  });

  for (const [name, TabletRow, MobileRow] of [
    ['events', EventTabletRow, EventMobileRow],
    ['observations', ObservationTabletRow, ObservationMobileRow],
  ] as const) {
    it(`renders ${name} desktop and expanded mobile input references`, () => {
      const row = {
        sourceTxId: 'source-transaction',
        fromChain: 'zcash',
        fromAddress: reference,
        toAddress: 'recipient',
        height: 1,
        amount: '100',
        bridgeFee: '1',
        networkFee: '1',
        lockToken: { name: 'ZEC', decimals: 8 },
        eventId: 'event',
        requestId: 'request',
        WIDsCount: 1,
      } as Parameters<typeof TabletRow>[0];
      const desktop = renderToStaticMarkup(createElement(TabletRow, row));
      expect(desktop).toContain(reference.slice(0, 10));
      expect(desktop).toContain('Input reference');
      expect(desktop).toContain('not a sender address');
      expect(desktop).not.toMatch(/href="[^"]*box:/);
      renderState.expandNext = true;
      const mobile = renderToStaticMarkup(createElement(MobileRow, row));
      expect(renderState.expandNext).toBe(false);
      expect(mobile).toContain('Input reference');
      expect(mobile).toContain(reference.slice(0, 10));
      expect(mobile).not.toContain('From Address');
      expect(mobile).not.toMatch(/href="[^"]*box:/);
    });
  }
});
