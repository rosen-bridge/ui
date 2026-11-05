import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import {
  Link,
  Stack,
  TableGrid,
  TableGridBody,
  TableGridCell,
  TableGridHeader,
  TableGridRow,
} from '@rosen-bridge/ui-kit';

export type FAQ = {
  title: string;
  items: {
    answer: ReactNode;
    question: string;
  }[];
};

const listStyle: CSSProperties = { margin: 0, paddingInlineStart: '24px' };

const ExternalLink = (props: ComponentProps<typeof Link>) => (
  <Link color="primary" rel="noreferrer" target="_blank" {...props} />
);

export const faqs: FAQ[] = [
  {
    title: 'Getting started',
    items: [
      {
        question: 'What is Rosen Bridge?',
        answer:
          'Rosen Bridge moves coins and tokens between blockchains. You lock a coin on one chain and receive the same amount, minus fees, as a wrapped token on another chain. When you bridge back, the wrapped token is locked by the bridge and the original coin is released.',
      },
      {
        question: 'How does a transfer work?',
        answer:
          "Independent operators called Watchers monitor each chain and report your transfer. Once enough of them agree, a second group called Guards checks the Watchers' reports, verifies the transfer again and sends your payment on the destination chain.",
      },
      {
        question: 'What are Watchers and Guards?',
        answer: (
          <>
            Watchers are independent operators who report transfers. Anyone can become one. Guards
            are a known group of organisations, listed on{' '}
            <ExternalLink href="https://rosen.tech">rosen.tech</ExternalLink>, who check the
            Watchers' reports, verify each transfer and sign the payment together. You do not need
            to do anything with either group.
          </>
        ),
      },
      {
        question: 'Which chains are supported?',
        answer:
          'Ergo, Cardano, Bitcoin, Bitcoin Runes, Dogecoin, Ethereum, BNB Chain (shown as Binance in the app), Firo and Handshake.',
      },
      {
        question: 'Why is a token or route not available?',
        answer:
          'Some tokens are only available on some routes. Choose the source chain and then the target chain to see the tokens you can bridge.',
      },
      {
        question: 'Do I need an account or KYC?',
        answer: 'No. Connect a wallet and start your transfer. There is no account and no KYC.',
      },
      {
        question: 'Is there a maximum transfer amount?',
        answer:
          'There is no fixed maximum. You can send as much as your wallet balance allows, after any amount kept back for fees. Large transfers can take longer to complete.',
      },
      {
        question: 'Is Rosen Bridge safe?',
        answer:
          'A transfer is paid only after Watchers report it and a required number of Guards verify and sign it. Most funds are kept in offline wallets that need several signatures. As with any bridge, some risk remains, so only transfer amounts you are comfortable with.',
      },
      {
        question: 'Is the code open source?',
        answer: (
          <>
            Yes. You can read the code at{' '}
            <ExternalLink href="https://github.com/rosen-bridge">
              github.com/rosen-bridge
            </ExternalLink>
            .
          </>
        ),
      },
      {
        question: 'Can you add a new chain?',
        answer: (
          <>
            We are always working on adding new chains. Some are suggested to us by the community
            and partners, and our team also looks for chains that would be a good fit for the
            bridge. When a new chain is planned, we announce it on our official channels. You can
            also add a chain yourself by following our{' '}
            <ExternalLink href="https://github.com/rosen-bridge/rcs/tree/master/rcs-003">
              Bridge Expansion Kit
            </ExternalLink>
            .
          </>
        ),
      },
      {
        question: 'How can I add my token to the bridge?',
        answer:
          'Projects can list a token by paying a listing fee to the Rosen Fund. Open-source projects get a discount. Ask in the Discord server for details.',
      },
      {
        question: 'How can I become a Watcher?',
        answer: (
          <>
            Anyone can run a Watcher. You need to deposit RSN and ERG as collateral and run the
            Watcher app. See the{' '}
            <ExternalLink href="https://github.com/rosen-bridge/operation/blob/dev/docs/watcher/deploy-docker.md">
              Watcher deployment guide
            </ExternalLink>{' '}
            in the Rosen operation documentation.
          </>
        ),
      },
      {
        question: 'Where can I see bridge statistics?',
        answer: (
          <>
            The <ExternalLink href="https://app.rosen.tech/assets">Assets page</ExternalLink> shows
            how much of each token is held by the bridge and how much has been bridged to each
            chain.
          </>
        ),
      },
    ],
  },
  {
    title: 'Tokens',
    items: [
      {
        question: 'What are rs-tokens (rsERG, rsADA, rsBTC, rsFIRO)?',
        answer:
          'An rs-token is the wrapped version of a coin on another chain. It is backed 1:1 by the coins locked in the bridge. For example, rsADA on Ergo represents ADA locked on Cardano.',
      },
      {
        question: 'What are RSN and eRSN?',
        answer: (
          <>
            RSN is Rosen's utility token. Watchers deposit it as collateral to report transfers.
            eRSN is the reward token that Guards give to Watchers for each transfer, and it can be
            converted to RSN at any time. You can read more in the{' '}
            <ExternalLink href="https://rosen.tech/#tokenomics">tokenomics section</ExternalLink> of
            our website.
          </>
        ),
      },
      {
        question: 'A token with "RSN" in its name appeared in my wallet. What is it?',
        answer: (
          <>
            Compare its ID with RSN on the{' '}
            <ExternalLink href="https://app.rosen.tech/assets">Assets page</ExternalLink>. Any other
            token called RSN is fake, so do not interact with it or open any link attached to it.
          </>
        ),
      },
      {
        question: 'How do I know a token is the real one?',
        answer: (
          <>
            Check its ID or contract address on the{' '}
            <ExternalLink href="https://app.rosen.tech/assets">Assets page</ExternalLink>. Names and
            symbols are easy to copy. Never trust a contract address sent to you in a chat or direct
            message.
          </>
        ),
      },
      {
        question: "I don't see my rs-tokens in my wallet. What should I do?",
        answer: (
          <>
            First, check that your transfer shows as paid on the{' '}
            <ExternalLink href="https://app.rosen.tech/events">Events page</ExternalLink>. On
            Ethereum and BNB Chain, you then need to add the token to your wallet using the contract
            address from the{' '}
            <ExternalLink href="https://app.rosen.tech/assets">Assets page</ExternalLink>. On other
            chains, refresh your wallet. If the token is still missing, contact support.
          </>
        ),
      },
      {
        question: 'Can I send rs-tokens to an exchange?',
        answer:
          'Only if the exchange supports that exact rs-token on that exact network. Never send rsFIRO, rsBTC or similar tokens to a native FIRO or BTC deposit address. Bridge back to the original coin first.',
      },
      {
        question: 'Can I trade rs-tokens on a decentralised exchange?',
        answer: (
          <>
            Yes, where the exchange supports that token. Check the token's contract address and
            decimals on the{' '}
            <ExternalLink href="https://app.rosen.tech/assets">Assets page</ExternalLink> first.
            Most open exchanges accept any token, but some only offer tokens they have listed
            themselves.
          </>
        ),
      },
      {
        question: 'Is rsFIRO private?',
        answer:
          'No. Bridge transfers and trades of rsFIRO are public. Spark privacy applies only to native FIRO, so bridge back to FIRO if you need privacy.',
      },
      {
        question: 'I received a little extra ERG with my tokens. Why?',
        answer:
          'This is expected. On Ergo, tokens must be held with a small amount of ERG, so each token payment includes a small amount. You do not need to do anything.',
      },
      {
        question: 'What do Locked, Hot, Cold and Bridged mean on the Assets page?',
        answer:
          'Locked is the amount of a token held by the bridge on its home chain. It is made up of Hot, the part kept ready for payments, and Cold, the part kept in cold storage. Bridged is the amount of the token on other chains, and "Bridged to" shows the amount on each chain.',
      },
    ],
  },
  {
    title: 'Wallets',
    items: [
      {
        question: 'Which wallet can I use?',
        answer: (
          <TableGrid>
            <TableGridHeader>
              <TableGridCell>Source chain</TableGridCell>
              <TableGridCell>Supported wallets</TableGridCell>
            </TableGridHeader>
            <TableGridBody>
              <TableGridRow>
                <TableGridCell>Ergo</TableGridCell>
                <TableGridCell>Nautilus</TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Cardano</TableGridCell>
                <TableGridCell>Eternl, Lace</TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Bitcoin</TableGridCell>
                <TableGridCell>OKX, Xverse</TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Bitcoin Runes</TableGridCell>
                <TableGridCell>Xverse</TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Dogecoin</TableGridCell>
                <TableGridCell>MyDoge</TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Ethereum, BNB Chain (shown as Binance in the app)</TableGridCell>
                <TableGridCell>MetaMask, WalletConnect</TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Handshake</TableGridCell>
                <TableGridCell>Shake</TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Firo</TableGridCell>
                <TableGridCell>Campfire, Stack Wallet, Firo-Qt (by QR code)</TableGridCell>
              </TableGridRow>
            </TableGridBody>
          </TableGrid>
        ),
      },
      {
        question: "Why can't I choose a wallet?",
        answer:
          'The wallet list depends on the source chain. Select a source chain first, and the available wallets will appear.',
      },
      {
        question: 'Which wallet should I use for Firo?',
        answer:
          'Use only the latest version of Campfire, Stack Wallet or Firo-Qt, and send from your transparent balance, not Spark. Scan or copy the transfer details exactly as shown. Other wallets, such as Firo Electrum, are not supported. They do not include these details, so the bridge does not process the transfer and you may lose your funds.',
      },
      {
        question: 'Can I use Nami?',
        answer: 'No. Nami is no longer supported. Use Eternl or Lace.',
      },
      {
        question:
          'I installed a wallet extension, but it does not appear as available. What should I do?',
        answer:
          'Reload the page after installing an extension. The app may not be able to connect to it until you do. If it still does not connect, your wallet may be locked, so unlock it and try again.',
      },
      {
        question:
          'I see the wrong wallet or a wrong balance, and I have several wallet extensions. What should I do?',
        answer:
          'Some extensions interfere with each other. OKX can replace MetaMask in your browser, and an active Trust Wallet extension can show wrong token amounts. Turn off the extensions you are not using for this transfer, then reload the page.',
      },
      {
        question: 'What should I check in MetaMask before bridging from Ethereum or BNB Chain?',
        answer: (
          <>
            On the MetaMask confirmation screen, untick <strong>Added protection</strong> if it
            appears, and do not turn on <strong>Smart account</strong> for this network. Rosen
            cannot detect transfers sent this way yet. Your tokens would reach the bridge address
            without being processed, and getting them back is not guaranteed. Any return would need
            a review and manual help from the team. Keep all other MetaMask settings on, including
            scam and phishing warnings.
          </>
        ),
      },
      {
        question: 'MetaMask says my account is a Smart Account. How do I fix it?',
        answer: (
          <>
            Open the account menu (⋮) and go to <strong>Account details → Smart account</strong>.
            Turn off the toggle for this network, then reload the page. Your address, funds and
            recovery phrase do not change.
          </>
        ),
      },
      {
        question: 'I use a Ledger with MetaMask and signing fails. What should I do?',
        answer: (
          <>
            You may need to change a setting on your Ledger. Open{' '}
            <strong>Ethereum → Settings</strong>, turn on <strong>Blind signing</strong> and{' '}
            <strong>Debug data</strong>, then try again.
          </>
        ),
      },
      {
        question:
          'MetaMask says the network has not been added, or that the switch was rejected. What should I do?',
        answer:
          'Add the network (Ethereum or BNB Chain) in MetaMask, then accept the request to switch networks when the app asks.',
      },
      {
        question: 'Which Bitcoin addresses can I use?',
        answer: (
          <>
            On Bitcoin, only Native SegWit addresses, which start with <code>bc1q</code>, for both
            sending and receiving.
          </>
        ),
      },
      {
        question: 'What do I need to bridge Bitcoin Runes?',
        answer: (
          <>
            You need Xverse. Your runes are held in your Ordinals address (Taproot, starting with{' '}
            <code>bc1p</code>). The Bitcoin network fee is paid from the BTC in your Ordinals
            address, or from your Payment address (SegWit, starting with <code>bc1q</code>) if the
            Ordinals address does not have enough. To receive runes, enter a Taproot address, which
            starts with <code>bc1p</code>.
          </>
        ),
      },
      {
        question: 'Which address can I use to receive Bitcoin Runes?',
        answer: (
          <>
            You need a Taproot address, which starts with <code>bc1p</code>.
          </>
        ),
      },
      {
        question: 'Why is my Eternl balance lower than I expected?',
        answer: (
          <>
            Eternl can set aside some ADA as collateral. You can check it under{' '}
            <strong>Settings → Account settings → Collateral</strong>.
          </>
        ),
      },
      {
        question: 'My wallet shows a balance of 0 in the app. What should I do?',
        answer:
          'Some wallet extensions interfere with each other, which can stop the app from reading your balance. Turn off all wallet extensions except the one you are using, then reconnect your wallet and reload the page. If the balance still shows 0, contact support with your wallet and browser version.',
      },
      {
        question: 'My wallet looks out of date, or the balance does not match. What should I do?',
        answer:
          'Wait for your wallet to finish syncing with the network, then close it and open it again. You can check your real balance in a block explorer.',
      },
      {
        question:
          'My wallet says I rejected the connection, the signature was denied, or the request timed out. What should I do?',
        answer:
          'Each of these means the wallet did not receive your approval in time, or you declined the request. Try again, and approve the request in your wallet window.',
      },
      {
        question:
          'I see "Transaction failed for the [wallet] wallet", or the signing window never opens. What should I do?',
        answer:
          'If your wallet is locked, unlock it. Then turn off other wallet extensions, reload the page and try again. If it still fails, contact support with the full error message, your wallet version and your browser.',
      },
    ],
  },
  {
    title: 'Amounts and fees',
    items: [
      {
        question: 'What fees do I pay?',
        answer: (
          <Stack spacing={1}>
            <span>
              Two fees are taken from the amount you send, and both are shown before you confirm:
            </span>
            <ul style={listStyle}>
              <li>
                <strong>Bridge Fee:</strong> the larger of a fixed minimum and a percentage of your
                amount.
              </li>
              <li>
                <strong>Transaction Fee:</strong> the cost of sending your payment on the
                destination chain.
              </li>
            </ul>
            <span>
              You also pay the normal network fee of the source chain in your wallet, such as ETH
              gas.
            </span>
          </Stack>
        ),
      },
      {
        question: 'How much is the Bridge Fee?',
        answer:
          'It is the larger of about $10 and 0.5% of your transfer. The same formula applies to all tokens on all networks. These values may be updated over time, so always check the current fees and the amount you will receive in the form before you confirm.',
      },
      {
        question: 'Who receives the fees?',
        answer:
          'The Bridge Fee is shared between the Watchers who report your transfer, the Guards who process it, and the bridge itself. The Transaction Fee goes to the Guards, who use it to pay for sending your payment on the destination chain.',
      },
      {
        question: 'Why did the fee change, or why do I see "Fees might change"?',
        answer:
          'Fee settings are updated from time to time. If a new setting starts soon, the form warns you that the fee may be different when your transaction is confirmed.',
      },
      {
        question: 'Do fees change with the token price?',
        answer:
          'Yes. The fixed part of the Bridge Fee is set in US dollars and converted into the token you send, so the token amount changes when the price changes. The percentage part does not depend on the price. The Transaction Fee can also change with network costs. The form always shows the current fees before you confirm.',
      },
      {
        question: 'Why did I receive less than the form showed?',
        answer:
          'The bridge charges the higher of the fee in your transaction and the current fee. If the fees went up after you filled in the form, you receive slightly less. Check the amounts again just before you confirm.',
      },
      {
        question: 'Why is my transfer so expensive?',
        answer: (
          <>
            The Bridge Fee has a fixed minimum, so it is a large share of a small amount. The
            Transaction Fee depends on the destination chain, and it is higher on chains such as
            Ethereum. To lower your costs, send a larger amount or choose a destination chain with
            lower network costs. Check <strong>You Will Receive</strong> before you confirm.
          </>
        ),
      },
      {
        question: 'What is the minimum transfer?',
        answer: (
          <>
            It is the Bridge Fee plus the Transaction Fee, plus the smallest possible unit of the
            token. The form shows it as <strong>Min Transfer</strong>. If your amount is lower, you
            see "Minimum transfer amount not respected", so enter a larger amount.
          </>
        ),
      },
      {
        question: 'Why is "Use all" lower than my balance?',
        answer:
          "When you send a chain's own coin, the app may keep back a small amount to pay for your transaction. Other tokens can be sent in full.",
      },
      {
        question: 'Why is "Use all" disabled or showing 0?',
        answer:
          'The button stays disabled until you enter a valid destination address. If it shows 0, check that you have connected your wallet, selected a token, and have a balance of that token.',
      },
      {
        question: 'I see a red icon instead of the "Use all" button. What should I do?',
        answer:
          'The app could not calculate the maximum amount you can send. Click the icon to try again. If it continues, reload the page.',
      },
      {
        question: 'What does "The current token only supports N decimals" mean?',
        answer: 'You entered more decimal places than this token allows. Shorten the amount.',
      },
      {
        question: 'What does "Balance insufficient" mean?',
        answer:
          'Your amount is more than you can send. Part of your balance may be kept back for fees. Lower the amount or add more coins.',
      },
      {
        question:
          'What does "at least X is still required to cover fees or minimum box requirements" mean?',
        answer:
          "Your wallet needs a little more of the chain's coin than the amount itself, to pay the fee and the minimum the network requires. Lower the amount or add more coins.",
      },
      {
        question: 'I have enough ERG, but I still get a "not enough" error. What should I do?',
        answer: (
          <>
            Your balance may be split into many small pieces. Use{' '}
            <strong>Wallet Optimization</strong> in Nautilus to combine them, then try again.
          </>
        ),
      },
      {
        question: 'Bridging Runes fails with "Boxes didn\'t cover required BTC". What should I do?',
        answer: (
          <>
            Add enough BTC to your Ordinals address (starting with <code>bc1p</code>) or your
            Payment address (starting with <code>bc1q</code>) in Xverse to pay the network fee.
            Either one works.
          </>
        ),
      },
      {
        question: 'Do I need gas on the destination chain?',
        answer:
          'No. The Guards send your payment, and its cost is included in the Transaction Fee. You only pay the network fee on the source chain. To move rs-tokens later on Ethereum or BNB Chain, you will need some ETH or BNB.',
      },
      {
        question: 'Does Rosen set the network fee?',
        answer:
          "No. Each blockchain has its own network fee and rules, including whether the fee is static or dynamic. These are outside Rosen's control, and we simply follow them. For details, see the network's own resources. The bridge form shows the network cost of your payment, and your wallet shows the fee for sending from the source chain.",
      },
    ],
  },
  {
    title: 'Addresses',
    items: [
      {
        question: 'Can I receive on a different address from the one I send from?',
        answer:
          'Yes. Enter any valid address on the destination chain. You do not need to connect a wallet for it.',
      },
      {
        question: 'What happens if I enter the wrong address?',
        answer:
          'A payment to a wrong address cannot be reversed. Check the address carefully before you confirm.',
      },
      {
        question: 'What does "Invalid Address" mean?',
        answer: (
          <>
            The address does not match the destination chain. For Bitcoin, it must start with{' '}
            <code>bc1q</code>, and for Bitcoin Runes, it must start with <code>bc1p</code>. Also
            check for extra spaces or missing characters.
          </>
        ),
      },
      {
        question: 'Can I send directly to the bridge address, or from an exchange?',
        answer:
          'No. The bridge reads your destination and fees from details attached to your transaction, and the Rosen app adds these details for you. A direct transfer, including any exchange withdrawal, does not have them, so it is not processed.',
      },
    ],
  },
  {
    title: 'Tracking and delays',
    items: [
      {
        question: 'How long does a transfer take?',
        answer:
          'A transfer usually takes 1 to 2 hours. It can take longer when networks are busy. Large transfers can take 1 to 2 days, because the funds must first be moved from offline storage.',
      },
      {
        question: 'Why does a transfer wait for confirmations?',
        answer:
          'The bridge waits until your transaction is final on the source chain, to protect against the chain reversing recent blocks. This is handled for you.',
      },
      {
        question: 'How do I track my transfer?',
        answer: (
          <>
            Open the <ExternalLink href="https://app.rosen.tech/events">Events page</ExternalLink>{' '}
            and search for your source transaction ID. The success message you see after sending
            also links to your transaction in a block explorer.
          </>
        ),
      },
      {
        question: 'My transfer is not on the Events page. What should I do?',
        answer:
          'New transfers appear a few minutes after the source transaction is confirmed. Check that it is confirmed in a block explorer, wait a little and search again. If it still does not appear, open a support ticket with your source transaction ID, destination address and the time you sent it.',
      },
      {
        question: 'My transfer seems stuck. What should I do?',
        answer:
          'Please wait first. A transfer can take longer when funds must be moved from offline storage, when fees on the destination chain are high, or when networks are busy. If nothing changes for much longer than usual, open a support ticket with your source transaction ID, destination address and the time you sent it.',
      },
      {
        question: 'Can I cancel a transfer?',
        answer: 'No. A transfer cannot be cancelled once it is sent.',
      },
      {
        question: 'My transfer is pending. Should I send again?',
        answer: 'No. Sending again creates a second, separate transfer.',
      },
      {
        question: 'The Firo QR code says it is time-sensitive. What does that mean?',
        answer:
          'If too much time passes before you send, the network or bridge fees may change and the transaction may fail. If you did not send right away, create a new QR code in the form.',
      },
      {
        question: 'The app is unavailable or shows a warning banner. What does it mean?',
        answer:
          'The bridge can pause for a short time during protocol updates, and the banner explains why. Transfers already in progress may or may not continue during this time. Follow the announcements channel on Discord for updates.',
      },
    ],
  },
  {
    title: 'Problems',
    items: [
      {
        question: 'The app does not display correctly. What should I do?',
        answer: (
          <Stack spacing={1}>
            <span>Try these steps in order:</span>
            <ol style={listStyle}>
              <li>Force reload the page (Ctrl+Shift+R, or Cmd+Shift+R on Mac).</li>
              <li>
                If the problem continues, turn off your browser extensions and reload the page.
              </li>
              <li>
                If it still does not work, clear this site's data in your browser and reload the
                page.
              </li>
            </ol>
            <span>If none of these steps help, contact support.</span>
          </Stack>
        ),
      },
      {
        question:
          'I see "something went wrong! please try again" while the fees load. What should I do?',
        answer:
          'The app could not load the fees. Reload the page and select your route again. If the message continues, try again later.',
      },
      {
        question: 'The Source list is empty. What should I do?',
        answer:
          'The list takes a moment to load, so please wait. If it stays empty, reload the page.',
      },
      {
        question: 'The Paste button does not work. What should I do?',
        answer:
          'Allow clipboard access for this site in your browser, or paste with your keyboard.',
      },
      {
        question: 'Can I get a refund?',
        answer:
          'Transfers are not refunded. In very rare and special cases, the team may approve and make a refund. To ask for a review, contact the Rosen team with your transaction ID.',
      },
    ],
  },
  {
    title: 'Security and support',
    items: [
      {
        question: 'Will the Rosen team ever message me first?',
        answer:
          "No. The team never sends the first direct message. Anyone who does is a scammer, even if their name and picture look like a team member's.",
      },
      {
        question: 'Will anyone from Rosen ask for my recovery phrase?',
        answer:
          'No. Nobody from the team will ever ask for your recovery phrase, private key or wallet password. Never share them or post them anywhere, including support channels.',
      },
      {
        question: 'What are the official links?',
        answer: (
          <TableGrid>
            <TableGridHeader>
              <TableGridCell>Channel</TableGridCell>
              <TableGridCell>Link</TableGridCell>
            </TableGridHeader>
            <TableGridBody>
              <TableGridRow>
                <TableGridCell>App</TableGridCell>
                <TableGridCell>
                  <ExternalLink href="https://app.rosen.tech">app.rosen.tech</ExternalLink>
                </TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Website</TableGridCell>
                <TableGridCell>
                  <ExternalLink href="https://rosen.tech">rosen.tech</ExternalLink>
                </TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Documentation</TableGridCell>
                <TableGridCell>
                  <ExternalLink href="https://docs.rosen.tech">docs.rosen.tech</ExternalLink>
                </TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Source code</TableGridCell>
                <TableGridCell>
                  <ExternalLink href="https://github.com/rosen-bridge">
                    github.com/rosen-bridge
                  </ExternalLink>
                </TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Discord</TableGridCell>
                <TableGridCell>
                  <ExternalLink href="https://discord.gg/AHgsxhDKrQ">
                    discord.gg/AHgsxhDKrQ
                  </ExternalLink>
                </TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>Telegram</TableGridCell>
                <TableGridCell>
                  <ExternalLink href="https://t.me/rosenbridge_erg">
                    t.me/rosenbridge_erg
                  </ExternalLink>
                </TableGridCell>
              </TableGridRow>
              <TableGridRow>
                <TableGridCell>X</TableGridCell>
                <TableGridCell>
                  <ExternalLink href="https://x.com/RosenBridge_erg">@RosenBridge_erg</ExternalLink>
                </TableGridCell>
              </TableGridRow>
            </TableGridBody>
          </TableGrid>
        ),
      },
      {
        question: 'How do I get help?',
        answer: (
          <>
            Join the{' '}
            <ExternalLink href="https://discord.gg/AHgsxhDKrQ">Rosen Discord server</ExternalLink>{' '}
            and open a ticket in the{' '}
            <ExternalLink href="https://discord.com/channels/1149394330981773393/1510264974923137226">
              #support channel
            </ExternalLink>
            , or email{' '}
            <Link color="primary" href="mailto:team@rosen.tech">
              team@rosen.tech
            </Link>
            . Describe your question or problem, and include any details that can help, such as a
            transaction ID, an error message or a screenshot.
          </>
        ),
      },
      {
        question: 'Does the app collect any data?',
        answer:
          'If an error happens, we may log information that you have already made public, such as your address or transaction details, to help us fix the problem. Rosen never logs your private data, and it does not even have access to your recovery phrase or private keys.',
      },
    ],
  },
];
