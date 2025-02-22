import { NETWORKS_KEYS } from '@rosen-ui/constants';
import { EmbedBuilder, WebhookClient } from 'discord.js';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const contracts = fs
  .readdirSync(__dirname)
  .filter((file) => file.startsWith('contracts-') && file.endsWith('.json'))
  .reduce((result, file) => {
    const name = file.split('.json').at(0).split('-').slice(1).join('-');

    const raw = fs.readFileSync(path.join(__dirname, file));

    const json = JSON.parse(raw);

    return [...result, { file, name, json }];
  }, []);

const content = [
  '/**************************************************',
  ' * THIS FILE IS AUTO-GENERATED. PLEASE DO NOT EDIT IT',
  ' * MANUALLY OR COMMIT IT TO THE REPOSITORY HOSTING SERVICE',
  ' **************************************************/',
  `import { NETWORKS } from '@rosen-ui/constants';`,
  '',
  `export const FEE_CONFIG_TOKEN_ID = '${contracts.at(0)?.json.tokens.RSNRatioNFT || ''}';`,
  '',
  `export const LOCK_ADDRESSES: { [key in keyof typeof NETWORKS]: string } = {`,
  ...NETWORKS_KEYS.map((network) => {
    const contract = contracts.find((contract) => contract.name == network);

    const value = contract ? contract.json.addresses.lock : '';

    return `  ${network.toUpperCase()}: '${value}',`;
  }),
  `} as any;`,
  '',
];

fs.writeFileSync(path.join(__dirname, './index.ts'), content.join('\n'));

contracts.forEach((contract) => fs.rmSync(path.join(__dirname, contract.file)));

if (!!process.env.DISCORD_NOTIFICATION_WEBHOOK_URL) {
  const webhookClient = new WebhookClient({
    url: process.env.DISCORD_NOTIFICATION_WEBHOOK_URL,
  });

  const embed = new EmbedBuilder()
    .setTitle('🚀 New Deployment Notification')
    .setColor(0x3498db)
    .setDescription('A new deployment has been triggered on **Vercel**.')
    .addFields(
      {
        name: '🌍 Branch URL',
        value: process.env.VERCEL_BRANCH_URL
          ? `[${process.env.VERCEL_BRANCH_URL}](https://${process.env.VERCEL_BRANCH_URL})`
          : 'N/A',
        inline: false,
      },
      {
        name: '📜 Commit Message',
        value: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'N/A',
        inline: false,
      },
      {
        name: '🔖 Commit Ref',
        value: process.env.VERCEL_GIT_COMMIT_REF || 'N/A',
        inline: false,
      },
    )
    .setTimestamp();

  webhookClient.send({
    embeds: [embed],
  });
}
