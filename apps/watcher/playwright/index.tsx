import {
  beforeMount,
  afterMount,
} from '@playwright/experimental-ct-react/hooks';

import SWRConfig from '@rosen-ui/swr-mock';

import { AppSnackbar, SnackbarProvider } from '@rosen-bridge/ui-kit';

import { ApiKeyContextProvider } from '@rosen-bridge/shared-contexts';

import ThemeProvider from '../app/_theme/ThemeProvider';

import mockedData from '../app/_mock/mockedData';

export type HooksConfig = {
  enableRouting?: boolean;
};

beforeMount(async ({ App }) => {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <ApiKeyContextProvider>
          <SWRConfig useMockedApis={true} fakeData={mockedData}>
            <App />
            <AppSnackbar />
          </SWRConfig>
        </ApiKeyContextProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
});
