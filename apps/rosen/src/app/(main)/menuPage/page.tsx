'use client';

import { useRef, useState } from 'react';

import {
  ChangeEventDetailsType,
  Menu2,
  MenuBody,
  MenuItem2,
  MenuTrigger,
  useMenu,
} from '@rosen-bridge/ui-kit';

const MenuPage = () => {
  const ref = useRef(null);
  const refControlled = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);

  const handleOpenChange = (
    isOpen: boolean,
    eventDetails: ChangeEventDetailsType,
  ) => {
    setOpen(isOpen);
    if (isOpen) {
      setActiveTrigger(eventDetails.trigger?.id ?? null);
    }
  };

  const handle = useMenu();

  return (
    <div>
      {/*Basic*/}
      <Menu2>
        <MenuTrigger>Open</MenuTrigger>
        <MenuBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <MenuItem2 key={i}> item {i}</MenuItem2>
          ))}
        </MenuBody>
      </Menu2>

      {/*Detached open*/}
      <MenuTrigger handle={handle}>Detached open</MenuTrigger>
      <Menu2 handle={handle}>
        <MenuBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <MenuItem2 key={i}> item {i}</MenuItem2>
          ))}
        </MenuBody>
      </Menu2>

      {/*Close with ref*/}
      <Menu2 actionRef={ref}>
        <MenuTrigger>Close with ref</MenuTrigger>
        <MenuBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <MenuItem2
              key={i}
              closeOnClick={false}
              onClick={() => {
                if (ref.current && i === 3) {
                  console.log('close');
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  ref?.current.close();
                }
              }}
            >
              {i !== 3 ? `item ${i}` : 'close menu ref'}{' '}
            </MenuItem2>
          ))}
        </MenuBody>
      </Menu2>

      {/*Open on hover*/}
      <Menu2>
        <MenuTrigger openOnHover>Open on hover</MenuTrigger>
        <MenuBody>
          {Array.from({ length: 4 }).map((_, i) => (
            <MenuItem2 key={i}> item {i}</MenuItem2>
          ))}
        </MenuBody>
      </Menu2>

      {/*Open on controlled*/}
      <div style={{ width: 'fit-content' }}>
        <input
          ref={refControlled}
          placeholder="Open on controlled"
          onFocus={() => {
            setActiveTrigger('menu-trigger-2');
            setOpen(true);
          }}
          type="text"
        />
      </div>
      <Menu2
        defaultTriggerId="menu-trigger-2"
        onOpenChange={handleOpenChange}
        triggerId={activeTrigger}
        open={open}
      >
        <MenuBody anchor={refControlled}>
          {Array.from({ length: 4 }).map((_, i) => (
            <MenuItem2 key={i}> item {i}</MenuItem2>
          ))}
        </MenuBody>
      </Menu2>
    </div>
  );
};

export default MenuPage;
