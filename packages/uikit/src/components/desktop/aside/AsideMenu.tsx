import { Account, AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { WalletId } from '@tonkeeper/core/dist/entries/wallet';
import { FC, forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { scrollToTop } from '../../../libs/common';
import { AppProRoute, AppRoute } from '../../../libs/routes';
import { useMutateUserUIPreferences, useUserUIPreferences } from '../../../state/theme';
import {
    useAccountsState,
    useCreateMAMAccountDerivation,
    useMutateActiveTonWallet
} from '../../../state/wallet';
import { fallbackRenderOver } from '../../Error';
import { ScrollContainer } from '../../ScrollContainer';
import { AsideHeader } from './AsideHeader';
import { DraggableProvidedDraggableProps } from 'react-beautiful-dnd';
import {
    AsideMenuAccount,
    AsideMenuSubItemContainer,
    WalletIndexBadgeStyled
} from './AsideMenuAccount';
import { AsideMenuFolder } from './AsideMenuFolder';

import { AccountsFolder } from '../../../state/folders';
import { AsideMenuItem } from '../../shared/AsideItem';
import { WalletEmoji } from '../../shared/emoji/WalletEmoji';
import { Label2 } from '../../Text';
import { PlusIcon } from '../../Icon';
import { AccountsPager } from './AsideAccountsMenu';
import { useTranslation } from '../../../hooks/translation';
import { View } from '@web3-explorer/uikit-view';
import { WalletBatchCreateNumber } from '../../create/WalletBatchCreateNumber';
import { useTheme } from 'styled-components';
import { useIAppContext } from '@web3-explorer/uikit-mui';


const AsideContainer = styled.div<{ width: number }>`
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    width: ${p => p.width}px;
    border-right: 1px solid ${p => p.theme.backgroundContentAttention};

    * {
        user-select: none;
    }
`;

export const AsideResizeHandle = styled.div`
    position: absolute;
    height: 100%;
    width: 10px;
    cursor: col-resize;
    right: -5px;
    z-index: 50;
`;

const AsideContentContainer = styled.div`
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    height: calc(100% - 69px);

    background: ${p => p.theme.backgroundContent};
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.5rem 0;
`;

const DividerStyled = styled.div<{ isHidden?: boolean }>`
    opacity: ${p => (p.isHidden ? 0 : 1)};
    height: 1px;
    background-color: ${p => p.theme.separatorCommon};
    margin: 0 -0.5rem;
    width: calc(100% + 1rem);
    transition: opacity 0.15s ease-in-out;
`;

const AsideMenuBottom = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: ${p => p.theme.backgroundContent};
    padding-bottom: 0.5rem;
`;

const IconWrapper = styled.div`
    color: ${p => p.theme.iconSecondary};
    height: fit-content;

    > svg {
        display: block;
    }
`;

const DraggingBlock = styled.div<{ $isDragging: boolean }>`
    cursor: pointer !important;
    border-radius: ${p => p.theme.corner2xSmall};
    overflow: hidden;
    transition: background-color 0.15s ease-in-out;
    ${p =>
        p.$isDragging &&
        css`
            pointer-events: auto !important;
            cursor: grabbing !important;
            background-color: ${p.theme.backgroundContentTint};

            * {
                pointer-events: none;
            }

            div {
                background-color: ${p.theme.backgroundContentTint};
            }
        `}
`;

export const AsideMenuDNDItem = forwardRef<
    HTMLDivElement,
    {
        item: Account | AccountsFolder;
        mightBeHighlighted: boolean;
        isDragging: boolean;
    } & DraggableProvidedDraggableProps
>(({ item, mightBeHighlighted, isDragging, ...rest }, fRef) => {
    const { mutateAsync: setActiveWallet } = useMutateActiveTonWallet();
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigateHome = useCallback(() => {
        const navigateHomeFromRoutes = [AppProRoute.dashboard, AppRoute.settings, AppRoute.browser];
        if (navigateHomeFromRoutes.some(path => location.pathname.startsWith(path))) {
            return navigate(AppRoute.home);
        } else {
            scrollToTop();
        }
    }, [location.pathname]);

    const onClickWallet = useCallback(
        (walletId: WalletId) => setActiveWallet(walletId).then(handleNavigateHome),
        [setActiveWallet, handleNavigateHome]
    );

    if (!item) {
        return null;
    }

    return (
        <DraggingBlock ref={fRef} $isDragging={isDragging} {...rest}>
            {item.type === 'folder' ? (
                <AsideMenuFolder
                    folder={item}
                    onClickWallet={onClickWallet}
                    accountMightBeHighlighted={mightBeHighlighted}
                />
            ) : (
                <AsideMenuAccount
                    account={item}
                    mightBeHighlighted={mightBeHighlighted}
                    onClickWallet={onClickWallet}
                />
            )}
        </DraggingBlock>
    );
});

export const AccountWalletsList = () => {
    const accounts = useAccountsState();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const { mutateAsync: setActiveWallet } = useMutateActiveTonWallet();

    const { mutateAsync: createDerivation } = useCreateMAMAccountDerivation();

    const handleNavigateHome = useCallback(() => {
        const navigateHomeFromRoutes = [AppProRoute.dashboard, AppRoute.settings, AppRoute.browser];
        if (navigateHomeFromRoutes.some(path => location.pathname.startsWith(path))) {
            return navigate(AppRoute.home);
        } else {
            scrollToTop();
        }
    }, [location.pathname]);

    const onClickWallet = useCallback(
        (walletId: WalletId) => setActiveWallet(walletId).then(handleNavigateHome),
        [setActiveWallet, handleNavigateHome]
    );

    const [openSetCountDialog, setOpenSetCountDialog] = useState(false);
    const [page, setPage] = useState(0);

    const theme = useTheme();
    const { showBackdrop } = useIAppContext();

    if (accounts.length === 0) {
        return null;
    }

    const accountMAM = accounts[0] as AccountMAM;
    const { derivations, activeDerivationIndex } = accountMAM;

    const total = derivations.length;

    const limit = 20;

    const onCreateDerivation = async () => {
        setOpenSetCountDialog(true);
    };

    const walletsList = derivations.slice().sort((a, b) => a.index - b.index);
    const wallets = walletsList.slice(page * limit, (page + 1) * limit);
    return (
        <>
            <View
                dialog={{
                    dialogProps: {
                        open: openSetCountDialog,
                        sx: {
                            '& .MuiDialog-paper': { width: 850, height: 400 }
                        }
                    },

                    content: (
                        <View wh100p row aCenter center bgColor={theme.backgroundContent}>
                            <View p={'12px'}>
                                <WalletBatchCreateNumber
                                    onClose={() => {
                                        setOpenSetCountDialog(false);
                                    }}
                                    submitHandler={async ({ count }: { count: number }) => {
                                        setOpenSetCountDialog(false);
                                        showBackdrop(true);
                                        showBackdrop(true);
                                        const d = await createDerivation({
                                            accountId: accountMAM.id,
                                            count: count
                                        });
                                        if (d) {
                                            await onClickWallet(d.activeTonWalletId);
                                        }
                                        showBackdrop(false);
                                        setPage(Math.ceil((total + count) / limit) - 1);
                                    }}
                                />
                            </View>
                        </View>
                    )
                }}
            />
            <AsideMenuBottom style={{ flex: 0 }}>
                <AsideMenuItem
                    style={{ marginBottom: 4 }}
                    isSelected={false}
                    onClick={onCreateDerivation}
                >
                    <IconWrapper>
                        <PlusIcon />
                    </IconWrapper>
                    <Label2>{t('aside_add_wallet')}</Label2>
                </AsideMenuItem>
                <DividerStyled isHidden={false} style={{ marginBottom: 4 }} />
            </AsideMenuBottom>
            <ScrollContainer>
                {wallets.map(wallet => {
                    return (
                        <AsideMenuSubItemContainer style={{ paddingLeft: 4 }} key={wallet.index}>
                            <AsideMenuItem
                                isSelected={activeDerivationIndex === wallet.index}
                                onClick={() => {
                                    onClickWallet(wallet.activeTonWalletId);
                                }}
                            >
                                <WalletEmoji
                                    emojiSize="16px"
                                    containerSize="16px"
                                    emoji={wallet.emoji}
                                />
                                <Label2>{wallet.name}</Label2>
                                <WalletIndexBadgeStyled size="s">
                                    {'#' + (wallet.index + 1)}
                                </WalletIndexBadgeStyled>
                            </AsideMenuItem>
                        </AsideMenuSubItemContainer>
                    );
                })}
            </ScrollContainer>
            <AsideMenuBottom>
                {
                    total > limit && <DividerStyled isHidden={false} style={{ marginBottom: 4 }} />
                }
                <AccountsPager
                    total={total}
                    limit={limit}
                    page={page}
                    setPage={(p: number) => setPage(p)}
                />
            </AsideMenuBottom>
        </>
    );
};

const AsideMenuPayload: FC<{ className?: string }> = ({ className }) => {
    const [asideWidth, setAsideWidth] = useState(250);
    const asideWidthRef = useRef(asideWidth);
    const isResizing = useRef(false);
    const { data: uiPreferences } = useUserUIPreferences();
    const { mutate: mutateWidth } = useMutateUserUIPreferences();

    useLayoutEffect(() => {
        if (uiPreferences?.asideWidth) {
            setAsideWidth(uiPreferences?.asideWidth);
            asideWidthRef.current = uiPreferences?.asideWidth;
        }
    }, [uiPreferences?.asideWidth]);

    useEffect(() => {
        const minWidth = 200;
        const maxWidth = 500;
        const onMouseUp = () => {
            document.body.style.cursor = 'unset';
            document.documentElement.classList.remove('no-user-select');
            isResizing.current = false;
            mutateWidth({ asideWidth: asideWidthRef.current });
        };

        const onMouseMove = (e: MouseEvent) => {
            if (isResizing.current) {
                const newWidth =
                    e.pageX < minWidth ? minWidth : e.pageX > maxWidth ? maxWidth : e.pageX;
                setAsideWidth(newWidth - 64);
                asideWidthRef.current = newWidth - 64;
            }
        };

        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        return () => {
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, [mutateWidth]);
    return (
        <AsideContainer width={asideWidth}>
            <AsideHeader width={asideWidth} />
            <AsideContentContainer className={className}>
                <AccountWalletsList />
            </AsideContentContainer>
            <AsideResizeHandle
                onMouseDown={() => {
                    isResizing.current = true;
                    document.body.style.cursor = 'col-resize';
                    document.documentElement.classList.add('no-user-select');
                }}
            />
        </AsideContainer>
    );
};

export const AsideMenu: FC<{ className?: string }> = ({ className }) => {
    return (
        <ErrorBoundary fallbackRender={fallbackRenderOver('Failed to load aside menu')}>
            <AsideMenuPayload className={className} />
        </ErrorBoundary>
    );
};
