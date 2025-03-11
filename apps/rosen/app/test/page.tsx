'use client';

import { useState } from 'react';

import { BitcoinCircle } from '@rosen-bridge/icons';
import {
  Flow,
  OPERATORS_EQUALITY,
  OPERATOR_BEEN,
  SearchableFilter,
  Selected,
  SvgIcon,
  VALUES_YESNO,
} from '@rosen-bridge/ui-kit';

const Test = () => {
  const [selected, setSelected] = useState<Selected[]>([]);

  const flows: Flow[] = [
    {
      name: 'assignee',
      label: 'Assignee',
      operators: OPERATORS_EQUALITY,
      input: (context) => ({
        type: context.operator == 'is' ? 'select' : 'multiple',
        options: [
          {
            value: 'alex',
            label: 'Alex',
          },
          {
            value: 'sam',
            label: 'Sam',
          },
        ],
      }),
    },
    {
      name: 'confidential',
      label: 'Confidential',
      unique: true,
      operators: [OPERATOR_BEEN],
      input: VALUES_YESNO,
    },
    {
      name: 'author',
      label: 'Author',
      operators: OPERATORS_EQUALITY,
      input: (context) => ({
        type: context.operator == 'is' ? 'select' : 'multiple',
        options: [
          {
            value: 'none',
            label: 'None',
          },
          {
            value: 'any',
            label: 'Any',
          },
        ],
      }),
    },
    {
      name: 'search-within',
      label: 'Search Within',
      unique: true,
      operators: [OPERATOR_BEEN],
      input: {
        type: 'select',
        options: [
          {
            value: 'titles',
            label: 'Titles',
            pre: (
              <SvgIcon>
                <BitcoinCircle />
              </SvgIcon>
            ),
            post: (
              <SvgIcon>
                <BitcoinCircle />
              </SvgIcon>
            ),
          },
          {
            value: 'descriptions',
            label: 'Descriptions',
          },
        ],
      },
    },
  ];

  return (
    <SearchableFilter
      flows={flows}
      selected={selected}
      onChange={setSelected}
    />
  );
};

export default Test;
