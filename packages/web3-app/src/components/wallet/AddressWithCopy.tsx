import { toShortValue } from '@tonkeeper/core/dist/utils/common';
import { CopyIcon, DoneIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useTranslation } from 'react-i18next';

import { View } from '@web3-explorer/uikit-view';
import { useRef, useState } from 'react';
import { Transition } from 'react-transition-group';
import styled, { useTheme } from 'styled-components';
import { useBlockChainExplorer } from '../../hooks/wallets';
import { useBrowserContext } from '../../providers/BrowserProvider';

const DoneIconStyled = styled(DoneIcon)`
    color: ${p => p.theme.accentGreen};
    zoom: 0.8;
`;

const CopyIconStyled = styled(CopyIcon)`
    color: ${p => p.theme.textPrimary};
    cursor: pointer;
    zoom: 0.8;
`;
export function AddressWithCopy({
    showAddress,
    address
}: {
    showAddress?: boolean;
    address: string;
}) {
    const { t } = useTranslation();
    const { openUrl } = useBrowserContext();

    const [copied, setIsCopied] = useState(false);
    const [hovered, setHovered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const sdk = useAppSdk();
    const accountExplorer = useBlockChainExplorer();

    const transitionStyles = {
        entering: { opacity: 1 },
        entered: { opacity: 1 },
        exiting: { opacity: 0 },
        exited: { opacity: 0 },
        unmounted: { opacity: 0 }
    };
    const onCopy = (e: any) => {
        clearTimeout(timeoutRef.current);
        sdk.copyToClipboard(address);
        setIsCopied(true);
        timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    const theme = useTheme();

    return (
        <View row aCenter jEnd>
            <View
                ml={6}
                hide={hovered && !showAddress}
                icon={'Language'}
                iconFontSize="0.8rem"
                tips={t('transaction_view_in_explorer')}
                iconButton={{ sx: { color: theme.textPrimary } }}
                iconButtonSmall
                onClick={(e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = accountExplorer.replace('%s', address);
                    openUrl(url);
                    return false;
                }}
            />
            <View
                ml={6}
                h100p
                row
                aCenter
                jEnd
                onClick={onCopy}
                onMouseOver={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <View
                    hide={showAddress ? undefined : !hovered}
                    center
                    mr={6}
                    textProps={{ fontSize: '0.8rem' }}
                    text={toShortValue(address)}
                />
                <View hide={hovered} center mr={0}>
                    <CopyIconStyled />
                </View>
                <View aCenter displayNone={!hovered}>
                    <Transition
                        nodeRef={ref}
                        in={hovered}
                        timeout={200}
                        onExited={() => setIsCopied(false)}
                    >
                        {state => (
                            <View
                                aCenter
                                sx={{
                                    transition: 'opacity 0.15s ease-in-out'
                                }}
                                ref={ref}
                                opacity={transitionStyles[state].opacity}
                            >
                                {copied ? <DoneIconStyled /> : <CopyIconStyled />}
                            </View>
                        )}
                    </Transition>
                </View>
            </View>
        </View>
    );
}
