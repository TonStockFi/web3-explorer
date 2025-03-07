import InputAdornment from '@web3-explorer/uikit-mui/dist/mui/InputAdornment';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useRef, useState } from 'react';
import { isValidDomain } from '../../common/utils';
import { BrowserTab, useBrowserContext } from '../../providers/BrowserProvider';
import WebviewService from '../../services/WebviewService';

export function UrlInput({
    isDiscover,
    currentUrl,
    urlReadOnly,
    tab
}: {
    urlReadOnly?: boolean;
    isDiscover?: boolean;
    currentUrl?: string;
    tab?: BrowserTab;
}) {
    const { t, openTabFromWebview, theme } = useBrowserContext();
    const inputRef = useRef<HTMLInputElement>(null);
    let isHttps = undefined;
    if (currentUrl) {
        isHttps = currentUrl.startsWith('https');
    }
    const [urlEdit, setUrlEdit] = useState(currentUrl || '');

    useEffect(() => {
        if (currentUrl !== urlEdit) {
            setUrlEdit(currentUrl || '');
        }
    }, [currentUrl]);

    return (
        <TextField
            type="url"
            ref={inputRef}
            onKeyDown={async e => {
                if (urlReadOnly) {
                    return;
                }
                if (e.key === 'Enter') {
                    let newUrl = urlEdit;
                    if (!newUrl || newUrl.trim() === currentUrl) {
                        if (tab?.tabId) {
                            new WebviewService(tab?.tabId).reloadWebview();
                        }
                        return;
                    }
                    newUrl = newUrl.trim();
                    if (newUrl.startsWith('chrome://')) {
                        return;
                    }
                    if (!newUrl.startsWith('http')) {
                        if (isValidDomain(newUrl)) {
                            newUrl = `https://${newUrl}`;
                        } else {
                            const url = `https://bing.com/search?q=${encodeURIComponent(newUrl)}`;
                            // `https://www.google.com/search?q=${encodeURIComponent(newUrl)}`
                            openTabFromWebview({
                                url,
                                name: '',
                                description: '',
                                icon: ''
                            });
                            if (currentUrl) {
                                setUrlEdit(currentUrl);
                            }

                            return;
                        }
                    }
                    openTabFromWebview({
                        url: newUrl,
                        name: '',
                        description: '',
                        icon: ''
                    });

                    if (currentUrl) {
                        setUrlEdit(currentUrl);
                    }
                }
            }}
            onFocus={e => {
                setTimeout(() => {
                    const input = e.target;
                    input.select();
                }, 200);
            }}
            onBlur={() => {
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                }
            }}
            onChange={e => {
                if (urlReadOnly) {
                    return;
                }
                setUrlEdit(e.target.value.trim());
            }}
            value={urlEdit}
            size="small"
            sx={{ width: `100%` }}
            placeholder={t('EnterWeb3address')}
            slotProps={{
                input: {
                    // readOnly: tab?.tabId === MAIN_NAV_TYPE.GAME_FI,
                    sx: isDiscover
                        ? {
                              borderRadius: '28px',
                              '& .MuiInputBase-input ': {
                                  py: '12px',
                                  px: '12px',
                                  fontSize: '1rem'
                              }
                          }
                        : {
                              borderRadius: '14px',
                              '& .MuiInputBase-input ': {
                                  py: '6px',
                                  fontSize: '0.8rem'
                              }
                          },
                    startAdornment: (
                        <View empty hide={isDiscover || currentUrl === ''}>
                            <InputAdornment sx={{ ml: '-10px' }} position="start">
                                <View
                                    wh={30}
                                    center
                                    iconButtonColor={theme.textPrimary}
                                    iconButton={false}
                                    iconButtonSmall
                                >
                                    <View
                                        iconFontSize="1rem"
                                        icon={isHttps ? 'Https' : 'LockOpen'}
                                    />
                                </View>
                            </InputAdornment>
                        </View>
                    )
                    // endAdornment: tab ? (
                    //     <View
                    //         empty
                    //         hide={
                    //             currentUrl === '' ||
                    //             urlReadOnly ||
                    //             tab?.tabId === MAIN_NAV_TYPE.GAME_FI
                    //         }
                    //     >
                    //         <InputAdornment sx={{ mr: '-10px' }} position="end">
                    //             <TopFavorView tabId={tab!.tabId} currentUrl={currentUrl!} />
                    //         </InputAdornment>
                    //     </View>
                    // ) : undefined
                }
            }}
        />
    );
}
