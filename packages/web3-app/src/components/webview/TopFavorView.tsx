import { md5 } from '@web3-explorer/lib-crypto/dist/utils';
import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import InputLabel from '@web3-explorer/uikit-mui/dist/mui/InputLabel';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import MenuItem from '@web3-explorer/uikit-mui/dist/mui/MenuItem';
import Select from '@web3-explorer/uikit-mui/dist/mui/Select';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { currentTs } from '../../common/utils';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { DEFAULT_FOLDER, useFavorContext } from '../../providers/FavorProvider';
import BrowserHistoryService, { BrowserHistoryProps } from '../../services/BrowserHistoryService';
import { getFocusWebviewByTabId } from './WebViewBrowser';

export function TopFavorView({ tabId, currentUrl }: { tabId: string; currentUrl: string }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { browserTabs } = useBrowserContext();
    const { favors, folders, setFolders, updateAt, saveFavor, removeFavor } = useFavorContext();
    const tab = browserTabs.get(tabId);
    const [urlHash, setUrlHash] = useState('');
    const [url, setUrl] = useState(Boolean(tab && tab!.twa) ? tab!.url : currentUrl);
    const [title, setTitle] = useState('');
    const [title1, setTitle1] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(DEFAULT_FOLDER);
    const open = Boolean(anchorEl);
    const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
        const favor = favors.get(urlHash);
        if (favor) {
            setTitle(favor.title);
            setUrl(favor.url);
            setSelectedFolder(favor.folder || DEFAULT_FOLDER);
        } else {
            const webview = getFocusWebviewByTabId(tabId);
            if (tab && tab.twa) {
                setUrl(tab.url);
                setTitle(tab.name!);
            } else {
                if (webview?.getURL()) {
                    setTitle(webview?.getTitle());
                    setUrl(webview?.getURL());
                }
            }
        }
        //@ts-ignore
        setAnchorEl(e.target);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const { t, theme } = useBrowserContext();

    const slotProps = {
        paper: {
            elevation: 0,
            sx: {
                bgcolor: theme.backgroundContentAttention,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: theme.backgroundContentAttention,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0
                }
            }
        }
    };

    useEffect(() => {
        const handleSiteTitleUpated = (event: any) => {
            const { detail } = event as any;
            console.log('handleSite TitleUpated', detail);
            setTitle1(detail.title);
        };

        if (tabId) {
            window.addEventListener(`siteTitleUpated_${tabId}`, handleSiteTitleUpated);
        }
        return () => {
            if (tabId) {
                window.addEventListener(`siteTitleUpated_${tabId}`, handleSiteTitleUpated);
            }
        };
    }, [tabId]);
    useEffect(() => {
        if (currentUrl) {
            (async () => {
                const urlHash = md5(currentUrl);
                setUrlHash(urlHash);
            })();
        }
    }, [currentUrl]);

    useEffect(() => {
        if (currentUrl) {
            (async () => {
                if (!favors.get(urlHash)) {
                    const res = await new BrowserHistoryService(urlHash).get();
                    if (res) {
                        saveFavor(res as BrowserHistoryProps, true);
                    }
                }
            })();
        }
    }, [urlHash]);

    return (
        <View empty>
            <IconButton
                sx={{ width: 26, height: 26 }}
                size={'small'}
                onClick={handleClick}
                edge="start"
                color="inherit"
                aria-label="menu"
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                <View
                    iconSmall={true}
                    icon={Boolean(favors.has(urlHash)) ? 'Star' : 'StarOutline'}
                />
            </IconButton>
            <Menu
                slotProps={slotProps}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                id="top-menu"
                MenuListProps={{
                    'aria-labelledby': 'fade-button'
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <View w={450} center px12 pb12 borderBox>
                    <View px12 pt12 w100p borderBox>
                        <FormControl sx={{ mb: 2, width: '100%' }} size="small">
                            <TextField
                                onChange={e => setTitle(e.target.value)}
                                value={title || title1}
                                size={'small'}
                                label={t('Title')}
                                id="folder-title"
                            />
                        </FormControl>
                        <FormControl sx={{ mb: 2, width: '100%' }} size="small">
                            <TextField
                                onChange={e => setUrl(e.target.value)}
                                value={url}
                                size={'small'}
                                label={t('Url')}
                                id="folder-url"
                            />
                        </FormControl>
                        <FormControl sx={{ width: '100%' }} size="small">
                            <InputLabel id="folder-select-small-label">{t('Favor')}</InputLabel>
                            <Select
                                onChange={e => {
                                    setSelectedFolder(e.target.value);
                                }}
                                labelId="folder-select-small-label"
                                id="folder-select-small"
                                value={selectedFolder}
                                label={t('Favor')}
                            >
                                {folders.map((row, index) => (
                                    <MenuItem key={index} value={row.name}>
                                        {t(row.name)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <View
                            hide={favors.has(urlHash)}
                            mt12
                            onClick={() => {
                                {
                                    if (url) {
                                        saveFavor({
                                            id: urlHash,
                                            title: title || title1,
                                            folder: selectedFolder,
                                            url,
                                            ts: currentTs()
                                        });
                                    }
                                    handleClose();
                                }
                            }}
                            buttonVariant="contained"
                            button={t('AddFavor')}
                            w100p
                        />

                        {favors.has(urlHash) && (
                            <View rowVCenter jSpaceBetween>
                                <View
                                    onClick={() => {
                                        removeFavor(urlHash);
                                        handleClose();
                                    }}
                                    mt12
                                    buttonVariant="outlined"
                                    button={t('CancelFavor')}
                                    w100p
                                />
                                <View
                                    mt12
                                    ml12
                                    onClick={() => {
                                        if (url) {
                                            saveFavor({
                                                id: urlHash,
                                                title: title || title1,
                                                folder: selectedFolder,
                                                url,
                                                ts: currentTs()
                                            });
                                        }

                                        handleClose();
                                    }}
                                    buttonVariant="contained"
                                    button={t('EditFavor')}
                                    w100p
                                />
                            </View>
                        )}
                    </View>
                </View>
            </Menu>
        </View>
    );
}
