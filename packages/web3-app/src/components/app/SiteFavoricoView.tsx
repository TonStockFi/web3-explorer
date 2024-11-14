import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import BrowserFavoricoService from '../../services/BrowserFavoricoService';
import { SpinnerIcon } from '../Spinner';

export function SiteFavoricoView({
    size,
    url,
    title
}: {
    size?: number;
    url: string;
    title: string;
}) {
    const [icon, setIcon] = useState('');
    useEffect(() => {
        console.log({ url });
        if (!url) {
            return;
        }
        const { host } = new URL(url);
        new BrowserFavoricoService(host).get().then((res: any) => {
            if (res) {
                setIcon(res.icon);
            }
        });
    }, [url]);
    return (
        <View empty>
            <View
                mr12
                hide={!icon}
                avatar={{
                    alt: title,
                    src: icon,
                    sx: { width: size || 20, height: size || 20 }
                }}
            />
            <View mr12 hide={!!icon}>
                <SpinnerIcon />
            </View>
        </View>
    );
}
