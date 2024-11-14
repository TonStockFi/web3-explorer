import * as React from 'react';
import { useState } from 'react';

import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle
} from '@web3-explorer/uikit-mui/dist/mui/Dialog';
import type { TextFieldProps } from '@web3-explorer/uikit-mui/dist/mui/TextField';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';

import { View } from '@web3-explorer/uikit-view/dist/View';
import { currentTs } from '../../common/utils';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useFavorContext } from '../../providers/FavorProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { BrowserFavorProps } from '../../services/BrowserFavorService';
import BrowserFavoricoService from '../../services/BrowserFavoricoService';

export default function EditFavor({
    id,
    onClose,
    onConfirm
}: {
    id: string;
    onClose: () => void;
    onConfirm: (v: BrowserFavorProps) => void;
}) {
    const { env } = useIAppContext();
    const { favors, saveFavor } = useFavorContext();
    const { t } = useBrowserContext();
    const handleClose = () => {
        onClose && onClose();
    };
    const [favor, setFavor] = useState<BrowserFavorProps | null>(null);
    const [icons, setIcons] = useState<string[]>([]);
    React.useEffect(() => {
        if (id) {
            const favor = favors.get(id)!;
            setFavor(favor);
            const uri = new URL(favor.url);
            new BrowserFavoricoService(uri.host).get().then(res => {
                if (res) {
                    const { icon, favicons } = res;
                    setIcons(favicons || [icon]);
                }
            });
        } else {
            setFavor(null);
        }
    }, [id, favors]);
    const p: Partial<TextFieldProps> = {
        autoFocus: true,
        required: true,
        margin: 'dense',
        type: 'text',
        fullWidth: true,
        variant: 'standard'
    };

    return (
        <React.Fragment>
            <Dialog
                open={!!favor}
                fullScreen={false}
                maxWidth={'md'}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        const { title, url } = formJson;
                        const v = {
                            ...favor,
                            ts: currentTs(),
                            id,
                            title,
                            url
                        };
                        saveFavor(v);
                        favor && onConfirm(v);
                        handleClose();
                    }
                }}
            >
                <DialogTitle>{t('EditFavor')}</DialogTitle>
                <DialogContent sx={{ minWidth: '460px' }}>
                    <View>
                        <TextField
                            {...p}
                            value={favor?.title || ''}
                            id="title"
                            name="title"
                            label={t('lable_favor_title')}
                            onChange={e => {
                                if (favor) {
                                    setFavor({
                                        ...favor,
                                        title: e.target.value
                                    });
                                }
                            }}
                        />
                    </View>

                    <View>
                        <TextField
                            {...p}
                            value={favor?.url || ''}
                            id="url"
                            name="url"
                            label={t('lable_favor_url')}
                            onChange={e => {
                                if (favor) {
                                    setFavor({
                                        ...favor,
                                        url: e.target.value
                                    });
                                }
                            }}
                        />
                    </View>
                    <View hide={!env.isDev} row aEnd py={12}>
                        {icons.map((icon, index) => (
                            <View pointer key={icon} mr12 tips={icon}>
                                <img key={icon} src={icon} alt="" />
                            </View>
                        ))}
                    </View>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('ok')}</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
