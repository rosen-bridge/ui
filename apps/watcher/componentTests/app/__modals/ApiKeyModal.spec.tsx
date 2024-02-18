import { test, expect } from '@playwright/experimental-ct-react';

import ApiKeyModal from '@/_modals/ApiKeyModal';

test('should open api key modal when apiKey icon button is pressed', async ({
  mount,
  page,
}) => {
  const component = await mount(<ApiKeyModal />);

  await page.getByRole('button').click();

  expect(await page.getByText('Set API key to access actions')).toBeVisible();
  await page.getByRole('textbox').type('hello');

  await expect(page.getByRole('textbox')).toHaveValue('hello');
});

test('should render stars instead of apiKey when user types by default', async ({
  mount,
  page,
}) => {
  const component = await mount(<ApiKeyModal />);

  await page.getByRole('button').click();

  await expect(page.getByText('Set API key to access actions')).toBeVisible();
  await page.getByRole('textbox').type('hello');

  await expect(page).toHaveScreenshot();
});

test('should show to clear text if the show button is activated', async ({
  mount,
  page,
}) => {
  const component = await mount(<ApiKeyModal />);

  await page.getByRole('button').click();
  await expect(page.getByText('Set API key to access actions')).toBeVisible();

  await page.getByLabel('Show key').click();
  await page.getByRole('textbox').type('hello');

  await expect(page.getByLabel('Hide key')).toBeVisible();
  await expect(page).toHaveScreenshot();
});

test('should open api should be able to type the api key', async ({
  mount,
  page,
}) => {
  const component = await mount(<ApiKeyModal />);

  await page.getByRole('button').click();

  expect(await page.getByText('Set API key to access actions')).toBeVisible();
  await page.getByRole('textbox').type('hello');

  await expect(page.getByRole('textbox')).toHaveValue('hello');
});

test('should clear the apiKey if the cross button is pressed', async ({
  mount,
  page,
}) => {
  const component = await mount(<ApiKeyModal />);

  await page.getByRole('button').click();

  expect(await page.getByText('Set API key to access actions')).toBeVisible();
  await page.getByRole('textbox').type('hello');
  await expect(page.getByRole('textbox')).toHaveValue('hello');

  await page.getByLabel('Clear').click();
  await expect(page.getByRole('textbox')).toHaveValue('');
});
