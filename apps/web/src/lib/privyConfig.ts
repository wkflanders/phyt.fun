import type { PrivyClientConfig } from "@privy-io/react-auth";

export const privyConfig: PrivyClientConfig = {
    appearance: {
        theme: 'dark',
        accentColor: '#00F6FB',
        logo: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkF3xIgVJvDkJmxutZaE5dj0qbGXU9Kl6ASci7P',
    },
    embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        showWalletUIs: true
    },
};