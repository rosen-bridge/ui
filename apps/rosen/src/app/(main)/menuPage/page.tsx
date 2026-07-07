'use client';

import { useRef, useState } from 'react';

import {
  Button,
  ChangeEventDetailsType,
  Icon,
  Menu2,
  MenuBody,
  MenuGroup,
  MenuGroupLabel,
  MenuItem2,
  MenuTrigger,
  TextField,
  useMenu,
} from '@rosen-bridge/ui-kit';

const MenuPage = () => {
  const refControlled = useRef(null);
  const [open, setOpen] = useState(false);

  const handle = useMenu();

  const handleOpenChange = (
    isOpen: boolean,
    eventDetails: ChangeEventDetailsType,
  ) => {
    if (eventDetails.reason === 'trigger-hover') {
      return;
    }

    setOpen(isOpen);
  };
  return (
    <div style={{ paddingTop: 2 }}>
      {/*Basic*/}
      <Menu2>
        <MenuTrigger
          as={Button}
          variant="contained"
          startIcon={<Icon name="ArrowRight" />}
          color="secondary"
        >
          Native true
        </MenuTrigger>
        <MenuBody align="end" placement="bottom">
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
      {/*Open on hover*/}
      <Menu2>
        <MenuTrigger
          openOnHover
          as={TextField}
          placeholder="hover for open"
        ></MenuTrigger>
        <MenuBody>
          <MenuGroup>
            <MenuGroupLabel>sort</MenuGroupLabel>
            {Array.from({ length: 4 }).map((_, i) => (
              <MenuItem2 key={i}> item {i}</MenuItem2>
            ))}
          </MenuGroup>
        </MenuBody>
      </Menu2>

      {/*Open on controlled*/}
      <div style={{ width: 'fit-content' }}>
        <input
          ref={refControlled}
          placeholder="Open on controlled"
          onClick={() => {
            setOpen(true);
          }}
          type="text"
        />
      </div>
      <Menu2 onOpenChange={handleOpenChange} open={open}>
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
