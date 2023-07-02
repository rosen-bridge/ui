import { SWRConfig as SWRConfigBase } from 'swr';
import mockMiddlewareFactory from './mockMiddlewareFactory';

export interface SWRConfigProps {
  children: React.ReactNode;
  useMockedApis: boolean;
  fakeData: {
    withStringKeys: Record<string, any>;
    withObjectKeys: Record<string, (params: any) => any>;
  };
}
/**
 * wrap `SWRConfig` of `swr`, adding a mock middleware to use mocked apis if
 * needed
 *
 * @param children
 * @param useMockedApis whether to use mocked apis instead of main ones
 * @param fakeData mocked data to use in mocked apis
 */
const SWRConfig = ({ children, useMockedApis, fakeData }: SWRConfigProps) => (
  <SWRConfigBase
    value={{
      use: useMockedApis ? [mockMiddlewareFactory(fakeData)] : [],
    }}
  >
    {children}
  </SWRConfigBase>
);

export default SWRConfig;
