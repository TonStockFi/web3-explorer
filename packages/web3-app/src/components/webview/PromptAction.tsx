import Fade from '@web3-explorer/uikit-mui/dist/mui/Fade';
import FormControl from '@web3-explorer/uikit-mui/dist/mui/FormControl';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import Menu from '@web3-explorer/uikit-mui/dist/mui/Menu';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { useLocalStorageState } from '@web3-explorer/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

import { onPromptChatGpt, onPromptGemini } from './SideWeb/SideWebviewInner';
import { getFocusWebviewByTabId } from './WebViewBrowser';

export function PromptAction({}: {}) {
    const { theme, sideWeb } = useBrowserContext();
    const { t } = useTranslation();
    const { env } = useIAppContext();
    const [prompts, setPrompts] = useLocalStorageState('prompts_9', '');

    const [showConfig, setShowConfig] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
        const initPrompt = `${t('PleaseTranslateTo').replace(`%{lang}`, t('en'))}
${t('PleaseTranslateTo').replace(`%{lang}`, t('zh_CN'))}`;
        if (!prompts) {
            setPrompts(initPrompt);
        }
        //@ts-ignore
        setAnchorEl(e.target);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);

    const slotProps = {
        paper: {
            elevation: 0,
            sx: {
                bgcolor: theme.backgroundContentAttention,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 2.5,
                ml: 2,
                '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 20,
                    width: 10,
                    height: 10,
                    bgcolor: theme.backgroundContentAttention,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0
                }
            }
        }
    };

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
                <View iconSmall={true} icon={'Psychology'} />
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
                <View w={360} center px={8} pb12 borderBox>
                    <View w100p borderBox hide={!showConfig}>
                        <View h={24} mb={8} rowVCenter jEnd>
                            <View
                                icon={'Close'}
                                iconButtonSmall
                                onClick={() => setShowConfig(false)}
                            />
                        </View>

                        <FormControl sx={{ mb: 2, width: '100%' }} size="small">
                            <TextField
                                multiline
                                value={prompts}
                                onChange={e => setPrompts(e.target.value.trim())}
                                rows={10}
                                size={'small'}
                                label={t('Prompt')}
                                id="prompt-title"
                                helperText={t('HelperPromptConfig')}
                            />
                        </FormControl>
                        <View button={t('save')} buttonVariant="contained" w100p />
                    </View>
                    <View list w100p borderBox hide={showConfig}>
                        <View
                            h={24}
                            mb={8}
                            pb={8}
                            rowVCenter
                            jEnd
                            borderBottomColor={theme.separatorCommon}
                        >
                            <View
                                icon={'Settings'}
                                iconButtonSmall
                                onClick={() => setShowConfig(true)}
                            />
                        </View>
                        {prompts.split('\n').map((prompt, index) => (
                            <View
                                onClick={async () => {
                                    handleClose();
                                    const tabId = `side_${sideWeb!.site}`;
                                    const webview = getFocusWebviewByTabId(tabId);
                                    if (webview && sideWeb?.site === 'ChatGpt') {
                                        await onPromptChatGpt(tabId, prompt.trim());
                                    }
                                    if (webview && sideWeb?.site === 'Gemini') {
                                        await onPromptGemini(tabId, prompt.trim());
                                    }
                                }}
                                listItemText={prompt}
                                key={index}
                            />
                        ))}
                    </View>
                </View>
            </Menu>
        </View>
    );
}
