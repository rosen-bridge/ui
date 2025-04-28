import { WalletConnect as WalletConnectIcon } from '@rosen-bridge/icons';
import { ConnectionRejectedError, Wallet } from '@rosen-ui/wallet-api';
import { WalletConnectModal } from '@walletconnect/modal';
import SignClient from '@walletconnect/sign-client';
import { ProposalTypes, SessionTypes } from '@walletconnect/types';

export abstract class WalletConnect extends Wallet {
  icon = WalletConnectIcon;

  label = 'Wallet Connect';

  link = 'https://walletconnect.network/';

  signClient: SignClient;

  walletConnectModal: WalletConnectModal;

  abstract namespaces: ProposalTypes.RequiredNamespaces;

  constructor(private projectId: string) {
    super();
  }

  get session(): SessionTypes.Struct | undefined {
    return this.signClient
      .find({
        requiredNamespaces: this.namespaces,
      })
      .at(-1);
  }

  initialize = async (): Promise<void> => {
    if (this.signClient) return;

    this.walletConnectModal = new WalletConnectModal({
      projectId: this.projectId,
      enableExplorer: false,
      themeVariables: {
        '--wcm-z-index': '100000',
      },
    });

    this.signClient = await SignClient.init({
      projectId: this.projectId,
    });
  };

  connect = async (silent?: boolean): Promise<void> => {
    await this.initialize();

    const session = this.session;

    if (session) {
      try {
        await this.signClient.connect({
          pairingTopic: session.pairingTopic,
          requiredNamespaces: this.namespaces,
        });
        return;
        // eslint-disable-next-line no-empty
      } catch {}
      if (silent) return;
    }

    try {
      const { uri, approval } = await this.signClient.connect({
        requiredNamespaces: this.namespaces,
      });

      this.walletConnectModal.openModal({ uri });

      await approval();
    } catch (error) {
      throw new ConnectionRejectedError(this.name, error);
    } finally {
      this.walletConnectModal.closeModal();
    }
  };

  disconnect = async (): Promise<void> => {
    await this.initialize();

    const session = this.session;

    if (!session) return;

    await this.signClient.disconnect({
      topic: session.topic,
      reason: {
        code: 6000,
        message: 'User disconnected',
      },
    });

    // TODO
    await this.disconnect();
  };

  isAvailable = (): boolean => {
    return true;
  };

  isConnected = async (): Promise<boolean> => {
    await this.initialize();
    return !!this.session;
  };
}
