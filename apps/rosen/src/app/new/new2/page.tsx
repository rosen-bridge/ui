'use client';

import React, { useState } from 'react';

import { useTransition } from '@/app/new/new2/useTransition2';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { ref, state, play } = useTransition({
    name: 'dropdown',
    animation: ['open', 'close'],//TODO :remove
    duration: 700,
  });

  const handleOpen = async () => {
    setIsOpen(true);
    await play("open");
  };

  const handleClose = async () => {
    await play("close");
    setIsOpen(false);
  };

  return (
    <div className="dropdown-wrapper">
      <button onClick={isOpen ? handleClose : handleOpen}>
        {isOpen ? 'open' : 'close'}
      </button>


        <div
          ref={ref}
          className="Dropdown"
          data-animation={isOpen ? 'open' : 'close'}
          data-state={state}
        >
          <ul>
            <li>list 1</li>
            <li>list 2</li>
            <li>list 3</li>
          </ul>
        </div>

    </div>
  );
};

export default Page;
