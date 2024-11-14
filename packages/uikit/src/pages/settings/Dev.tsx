import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, switchNetwork } from '@tonkeeper/core/dist/entries/network';
import React, { useMemo } from 'react';
import { InnerBody } from '../../components/Body';
import { CloseIcon, SpinnerIcon } from '../../components/Icon';
import { SettingsItem, SettingsList } from '../../components/settings/SettingsList';
import { useAppSdk } from '../../hooks/appSdk';
import { useTranslation } from '../../hooks/translation';
import { useDevSettings, useMutateDevSettings } from '../../state/dev';
import { useActiveWallet } from '../../state/wallet';

const CookieSettings = () => {
    const sdk = useAppSdk();
    const client = useQueryClient();

    const { mutate, isLoading } = useMutation(async () => {
        await sdk.cookie?.cleanUp();
        await client.invalidateQueries();
    });

    const items = useMemo<SettingsItem[]>(() => {
        return [
            {
                name: 'Clean All Cookies',
                icon: isLoading ? <SpinnerIcon /> : <CloseIcon />,
                action: () => mutate()
            }
        ];
    }, [mutate, isLoading]);

    if (!sdk.cookie) {
        return null;
    }

    return <SettingsList items={items} />;
};

export const DevSettings = React.memo(() => {
    const { t } = useTranslation();

    const wallet = useActiveWallet();
    const { mutate: mutateDevSettings } = useMutateDevSettings();
    const { data: devSettings } = useDevSettings();

    const items = useMemo<SettingsItem[]>(() => {
        const network = devSettings?.tonNetwork ?? Network.MAINNET;
        return [
            {
                name: t('settings_network_alert_title'),
                icon: network === Network.MAINNET ? 'Mainnet' : 'Testnet',
                action: () => mutateDevSettings({ tonNetwork: switchNetwork(network) })
            }
        ];
    }, [t, wallet, devSettings]);

    return (
        <>
            {/* <SubHeader title="Dev Menu" /> */}
            <InnerBody>
                <SettingsList items={items} />
                <CookieSettings />
                {/* TODO: ENABLE TRON */}
                {/* <SettingsList items={items2} /> */}
            </InnerBody>
        </>
    );
});
DevSettings.displayName = 'DevSettings';
