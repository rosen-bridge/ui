import { RosenAmountValue } from '@rosen-ui/types';

export interface BridgeForm {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: RosenAmountValue | null;
}
/**
 * bridge main layout
 */
const RosenBridge = () => {
  return <div>page</div>;
};

export default RosenBridge;
