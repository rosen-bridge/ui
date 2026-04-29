'use client';

import {  useEffect, useRef, useState } from 'react';

import { useTransition } from '@/app/new/useTransition';

const Page = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const t = useTransition({
    ref,
    onEntered: () => console.log('entered'),
    onExited: () => console.log('exited'),
  });

  const shouldRender = open || t.state !== 'exited';

  useEffect(() => {
    if (open) {
      t.enter();
    } else {
      t.exit();
    }

    return () => {
      t.stop();
    };
  }, [open]);

  return (
    <div style={{ padding: 40 }}>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        {open ? 'close' : 'open'}
      </button>

      {shouldRender && (
        <div ref={ref} className="dropdown" data-animation={t.state}>
          <div>item 1</div>
          <div>item 2</div>
          <div>item 3</div>
        </div>
      )}
    </div>
  );
};

export default Page;
