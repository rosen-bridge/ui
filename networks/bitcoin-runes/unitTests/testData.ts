import crypto from 'crypto';

import {
  UnisatAddressAvailableBtcUtxos,
  UnisatAddressBtcUtxos,
  UnisatAddressRunesUtxos,
  UnisatResponse,
} from '../src/types';

export const fromAddress =
  'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z';

export const lockAddress =
  'bc1pvpyum6lxgrfr675wz8v9jxk2jmqvm9nzdly9p2cmvhnawhl0tvtsz73adv';

export const lockData = crypto.randomBytes(80).toString('hex');

export const internalPubkey =
  '187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27';

export const transferToken = {
  tokenId: '880352:855',
  name: 'TESTINGCATAETCH',
  decimals: 2,
  type: 'type',
  residency: 'wrapped',
  extra: {},
};

export const runesBoxes: UnisatResponse<UnisatAddressRunesUtxos>[] = [
  {
    code: 0,
    data: {
      height: 918734,
      start: 0,
      total: 1,
      utxo: [
        {
          height: 915580,
          confirmations: 3155,
          address:
            'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z',
          satoshi: 500, // 1485,
          scriptPk:
            '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          txid: 'ba9bd0e9c84b2743313d3b7f34777e9dab0688fc85fa9cce8cbb340f8d06ffcb',
          vout: 0,
          runes: [
            {
              rune: 'TESTINGCATAETCH',
              runeid: '880352:855',
              spacedRune: 'TESTING•CATA•ETCH',
              amount: '4492999000',
              symbol: 'H',
              divisibility: 2,
            },
          ],
        },
      ],
    },
  },
  {
    code: 0,
    data: {
      height: 918734,
      start: 2,
      total: 1,
      utxo: [],
    },
  },
];

export const runesBoxes2: UnisatResponse<UnisatAddressRunesUtxos>[] = [
  {
    code: 0,
    data: {
      height: 918734,
      start: 0,
      total: 1,
      utxo: [
        {
          height: 915580,
          confirmations: 3155,
          address:
            'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z',
          satoshi: 5000,
          scriptPk:
            '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          txid: 'ba9bd0e9c84b2743313d3b7f34777e9dab0688fc85fa9cce8cbb340f8d06ffcb',
          vout: 0,
          runes: [
            {
              rune: 'TESTINGCATAETCH',
              runeid: '880352:855',
              spacedRune: 'TESTING•CATA•ETCH',
              amount: '4492999000',
              symbol: 'H',
              divisibility: 2,
            },
          ],
        },
      ],
    },
  },
];

export const availableBtcBoxes: UnisatResponse<UnisatAddressAvailableBtcUtxos>[] =
  [
    {
      code: 0,
      msg: 'ok',
      data: {
        cursor: 0,
        total: 0,
        utxo: [],
      },
    },
  ];

export const availableBtcBoxes2: UnisatResponse<UnisatAddressAvailableBtcUtxos>[] =
  [
    {
      code: 0,
      msg: 'ok',
      data: {
        cursor: 0,
        total: 1,
        utxo: [
          {
            confirmations: 10,
            txid: '22b93e565aaa62ab0fa1471fcaabaa7e665a4d3d3623186bd36a241cbe65f850',
            vout: 0,
            satoshi: 55133,
            scriptType: '5120',
            scriptPk:
              '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
            codeType: 9,
            address:
              'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z',
            height: 915891,
            idx: 669,
            isOpInRBF: false,
            isSpent: false,
            inscriptionsCount: 1,
            inscriptions: [],
          },
        ],
      },
    },
  ];

export const allBtcBoxes: UnisatResponse<UnisatAddressBtcUtxos>[] = [
  {
    code: 0,
    msg: 'ok',
    data: {
      cursor: 0,
      total: 4,
      totalConfirmed: 4,
      totalUnconfirmed: 0,
      totalUnconfirmedSpend: 0,
      utxo: [
        {
          txid: '22b93e565aaa62ab0fa1471fcaabaa7e665a4d3d3623186bd36a241cbe65f850',
          vout: 0,
          satoshi: 55133,
          scriptType: '5120',
          scriptPk:
            '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          codeType: 9,
          address:
            'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z',
          height: 915891,
          idx: 669,
          isOpInRBF: false,
          isSpent: false,
          inscriptionsCount: 1,
          inscriptions: [],
        },
        {
          txid: 'e0e441e42a33126398d2d044599ec9dfcfd86a1e40d1c2836fadb4b53bb5cf29',
          vout: 1,
          satoshi: 500,
          scriptType: '5120',
          scriptPk:
            '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          codeType: 9,
          address:
            'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z',
          height: 904746,
          idx: 1071,
          isOpInRBF: false,
          isSpent: false,
          inscriptionsCount: 0,
          inscriptions: [],
        },
      ],
    },
  },
  {
    code: 0,
    msg: 'ok',
    data: {
      cursor: 2,
      total: 4,
      totalConfirmed: 4,
      totalUnconfirmed: 0,
      totalUnconfirmedSpend: 0,
      utxo: [
        {
          txid: 'ba9bd0e9c84b2743313d3b7f34777e9dab0688fc85fa9cce8cbb340f8d06ffcb',
          vout: 0,
          satoshi: 500,
          scriptType: '5120',
          scriptPk:
            '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          codeType: 9,
          address:
            'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z',
          height: 915580,
          idx: 1029,
          isOpInRBF: false,
          isSpent: false,
          inscriptionsCount: 0,
          inscriptions: [],
        },
        {
          txid: '7d22bdccbe0bd61aa85b06249e34b4f3c68e7617717022dbb2d7ce0c49e589f0',
          vout: 1,
          satoshi: 546,
          scriptType: '5120',
          scriptPk:
            '512033fadad0034bb0a7912d2bbf2c9163627ba5ec7833341418595418c33deb0fb7',
          codeType: 9,
          address:
            'bc1pjxzw9tm6qatyapu3c409dg8k23p4hjlk4ehwwlsum3emjqsaetrqppyu2z',
          height: 913922,
          idx: 1206,
          isOpInRBF: false,
          isSpent: false,
          inscriptionsCount: 0,
          inscriptions: [],
        },
      ],
    },
  },
  {
    code: 0,
    msg: 'ok',
    data: {
      cursor: 4,
      total: 4,
      totalConfirmed: 4,
      totalUnconfirmed: 0,
      totalUnconfirmedSpend: 0,
      utxo: [],
    },
  },
];
