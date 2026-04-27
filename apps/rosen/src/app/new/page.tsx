'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

import { useTransition } from '@/app/new/useTransition';

const Page = () => {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  const { state } = useTransition({
    trigger: open,
    ref,
  });

  // useEffect(() => {
  //   console.log('status', state, open ? 'opened' : 'closed');
  // }, [state, open]);

  return (
    <div style={{ padding: 40 }}>
      <button
        onClick={() => {
          setOpen((p) => !p);
        }}
      >
        toggle dropdown
      </button>

      <div
        ref={ref}
        className={`Dropdown`}
        data-state={state}
        data-name={open ? 'open' : 'close'}
      >
        <div className="Dropdown__content">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      </div>

      <small>state: {state}</small>
    </div>
  );
};

export default Page;
