import Paper from '@mui/material/Paper';
import { useTranslation } from '@web3-explorer/lib-translation';
import Divider from '@web3-explorer/uikit-mui/dist/mui//Divider';
import InputBase from '@web3-explorer/uikit-mui/dist/mui/InputBase';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';
import { focusWebviewFindInPage, focusWebviewStopFindInPage } from './WebViewBrowser';

export default function FindInPage({
    hideSearch,
    findInPage,
    tabId
}: {
    tabId: string;
    findInPage: { text?: string } | null;
    hideSearch: () => void;
}) {
    const theme = useTheme();

    const { t } = useTranslation();

    const [value, setValue] = useState(findInPage?.text || '');
    useEffect(() => {
        setValue(findInPage?.text || '');
        console.log({ findInPage });
    }, [findInPage?.text]);

    useEffect(() => {
        if (tabId) {
            if (value) {
                focusWebviewFindInPage(tabId, value);
            } else {
                focusWebviewStopFindInPage(tabId);
            }
        }
        return () => {
            tabId && focusWebviewStopFindInPage(tabId);
        };
    }, [value]);
    return (
        <Paper
            component="form"
            sx={{
                bgcolor: theme.backgroundPage,
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 400
            }}
        >
            <InputBase
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        tabId && focusWebviewFindInPage(tabId, value);
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }}
                onChange={(e: any) => {
                    const { value } = e.target;
                    setValue(value);
                }}
                value={value}
                autoFocus
                sx={{ ml: 1, flex: 1 }}
                placeholder={t('FindInPage')}
                inputProps={{ 'aria-label': t('FindInPage') }}
            />
            <View
                onClick={() => {
                    tabId && focusWebviewFindInPage(tabId, value, { forward: false });
                }}
                iconButtonSmall
                icon="ArrowUpward"
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <View
                onClick={() => {
                    hideSearch();
                    tabId && focusWebviewStopFindInPage(tabId);
                }}
                iconButtonSmall
                icon="Close"
            />
        </Paper>
    );
}
