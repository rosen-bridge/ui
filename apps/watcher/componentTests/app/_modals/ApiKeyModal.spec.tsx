import { test, expect } from '@playwright/experimental-ct-react';

import ApiKeyModal from '@/_modals/ApiKeyModal';

test.describe('ApiKeyModal', () => {
  /**
   * @target ApiKeyModal should open api key modal when apiKey icon button is pressed
   *
   * @dependencies
   * - watcher service api mocks
   *
   * @scenario
   * - mount the component
   * - find the modal button and click on it
   * - type a test apiKey in the text input
   * - check if the text is present in the input
   *
   * @expected
   * - it should render the typed words inside the input
   */
  test('should open api key modal when apiKey icon button is pressed', async ({
    mount,
    page,
  }) => {
    const component = await mount(<ApiKeyModal />);

    await page.getByRole('button').click();

    expect(await page.getByText('Set API key to access actions')).toBeVisible();
    await page.getByRole('textbox').type('test Apikey');

    await expect(page.getByRole('textbox')).toHaveValue('test Apikey');
  });

  /**
   * @target ApiKeyModal should render stars instead of plain
   * text when user types in the input by default
   *
   * @dependencies
   * - watcher service api mocks
   *
   * @scenario
   * - mount the component
   * - find the modal button and click on it
   * - type a test apiKey in the text input
   * - take an screenshot for visual regression testing
   *
   * @expected
   * - should have identical rendering between different runs
   */
  test.skip('should render stars instead of plain text when user types in the input by default', async ({
    mount,
    page,
  }) => {
    const component = await mount(<ApiKeyModal />);

    await page.getByRole('button').click();

    await expect(page.getByText('Set API key to access actions')).toBeVisible();
    await page.getByRole('textbox').type('test Apikey');

    await expect(page).toHaveScreenshot();
  });

  /**
   * @target ApiKeyModal should show plain text and
   * hide button if the show button is toggled
   *
   * @dependencies
   * - watcher service api mocks
   *
   * @scenario
   * - mount the component
   * - find the modal button and click on it
   * - click on the show button to see plain text
   * - type a test apiKey in the text input
   * - take an screenshot for visual regression testing
   *
   * @expected
   * - should render the hidden button
   * - should have identical rendering between different runs
   */
  test.skip('should show plain text and hide button if the show button is toggled', async ({
    mount,
    page,
  }) => {
    const component = await mount(<ApiKeyModal />);

    await page.getByRole('button').click();
    await expect(page.getByText('Set API key to access actions')).toBeVisible();

    await page.getByLabel('Show key').click();
    await page.getByRole('textbox').type('test Apikey');

    await expect(page.getByLabel('Hide key')).toBeVisible();
    await expect(page).toHaveScreenshot();
  });

  /**
   * @target ApiKeyModal should clear the apiKey
   * if the clear button is clicked
   *
   * @dependencies
   * - watcher service api mocks
   *
   * @scenario
   * - mount the component
   * - find the modal button and click on it
   * - type a test apiKey in the text input
   * - take an screenshot for visual regression testing
   * - click on the Clear button
   *
   * @expected
   * - should render the text inside the input as the user types
   * - should clear the when the clear button is pressed
   */
  test('should clear the apiKey if the clear button is clicked', async ({
    mount,
    page,
  }) => {
    const component = await mount(<ApiKeyModal />);

    await page.getByRole('button').click();

    expect(await page.getByText('Set API key to access actions')).toBeVisible();
    await page.getByRole('textbox').type('test Apikey');
    await expect(page.getByRole('textbox')).toHaveValue('test Apikey');

    await page.getByLabel('Clear').click();
    await expect(page.getByRole('textbox')).toHaveValue('');
  });
});
