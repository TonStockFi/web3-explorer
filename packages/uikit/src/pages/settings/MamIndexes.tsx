import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { FC, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { InnerBody } from '../../components/Body';
import { PencilIcon,KeyIcon } from '../../components/Icon';
import { SubHeader } from '../../components/SubHeader';
import { Label2 } from '../../components/Text';
import { useTranslation } from '../../hooks/translation';
import {
    useActiveAccount,
    useEnableMAMAccountDerivation,
    useHideMAMAccountDerivation,
    useTonWalletsBalances
} from '../../state/wallet';
import { ListBlockDesktopAdaptive, ListItem } from '../../components/List';
import { Button } from '../../components/fields/Button';
import { Navigate } from 'react-router-dom';
import { SkeletonListDesktopAdaptive } from '../../components/Skeleton';
import { WalletEmoji } from '../../components/shared/emoji/WalletEmoji';
import { WalletIndexBadge } from '../../components/account/AccountBadge';
import {
    DesktopViewHeader,
    DesktopViewPageLayout
} from '../../components/desktop/DesktopViewLayout';
import { IconButtonTransparentBackground } from '../../components/fields/IconButton';
import { useRecoveryNotification } from '../../components/modals/RecoveryNotificationControlled';
import { useRenameNotification } from '../../components/modals/RenameNotificationControlled';
import { useIsFullWidthMode } from '../../hooks/useIsFullWidthMode';
import { usePrevious } from '../../hooks/usePrevious';
import { scrollToContainersBottom } from '../../libs/web';

const FirstLineContainer = styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
`;

const TextContainer = styled.span`
    flex-direction: column;
    display: flex;
    align-items: flex-start;
`;

const ButtonsContainer = styled.div`
    margin-left: auto;
    display: flex;
    gap: 8px;
`;

export const MAMIndexesPage = () => {
    const { t } = useTranslation();
    const account = useActiveAccount();
    const isFullWidth = useIsFullWidthMode();

    if (account.type !== 'mam') {
        return <Navigate to="../" />;
    }

    if (isFullWidth) {
        return (
            <DesktopViewPageLayout>
                <DesktopViewHeader backButton>
                    <Label2>{t('settings_mam_indexes')}</Label2>
                </DesktopViewHeader>
                <MAMIndexesPageContentStyled
                    buttonWrapperClassName="mam-page-sticky-button-wrapper"
                    account={account}
                />
            </DesktopViewPageLayout>
        );
    }

    return (
        <>
            <SubHeader title={t('settings_mam_indexes')} />
            <InnerBody>
                <MAMIndexesPageContent account={account} />
            </InnerBody>
        </>
    );
};

const ListBlockStyled = styled(ListBlockDesktopAdaptive)`
    margin-bottom: 0;
`;
//
// const FooterButtonContainerStyled = styled.div`
//     padding: 1rem;
//     margin: 0 -1rem;
//     background-color: ${p => p.theme.backgroundPage};
// `;


const IconButtonTransparentBackgroundStyled = styled(IconButtonTransparentBackground)`
    > svg {
        color: ${p => p.theme.iconTertiary};
    }
`;

const NameContainer = styled.div`
    display: flex;
    gap: 1rem;
`;
const ListItemPayload = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    padding: 1rem 1rem 1rem 0;
    box-sizing: border-box;
    gap: 10px;

    width: 100%;

    ${props =>
        props.theme.displayType === 'full-width'
            ? 'align-items: center;'
            : 'flex-direction: column;'}
`;

const ContentWrapper = styled.div``;

export const MAMIndexesPageContent: FC<{
    afterWalletOpened?: () => void;
    account: AccountMAM;
    className?: string;
    page?: number;
    limit?: number;
    buttonWrapperClassName?: string;
}> = ({ page, limit, account, className }) => {
    const { t } = useTranslation();
    const { onOpen: recovery } = useRecoveryNotification();
    const ref = useRef<HTMLDivElement | null>(null);
    const { data: balances } = useTonWalletsBalances(
        account.allAvailableDerivations.map(
            d => d.tonWallets.find(w => w.id === d.activeTonWalletId)!.rawAddress
        )
    );

    const { allAvailableDerivations:derivations } = account;
    const walletsList = derivations.slice().sort((a, b) => a.index - b.index);
    let wallets = derivations;
    if (page !== undefined && limit !== undefined) {
        wallets = walletsList.slice(page * limit, (page + 1) * limit);
    }

    const { mutate: hideDerivation, isLoading: isHideDerivationLoading } =
        useHideMAMAccountDerivation();

    const { mutate: enableDerivation, isLoading: isEnableDerivationLoading } =
        useEnableMAMAccountDerivation();

    const { onOpen: rename } = useRenameNotification();

    const totalDerivationsDisplayed = balances?.length;
    const totalDerivationsDisplayedPrev = usePrevious(totalDerivationsDisplayed);
    useLayoutEffect(() => {
        if (
            totalDerivationsDisplayed !== undefined &&
            totalDerivationsDisplayedPrev !== undefined &&
            totalDerivationsDisplayed > totalDerivationsDisplayedPrev &&
            ref.current
        ) {
            scrollToContainersBottom(ref.current);
        }
    }, [totalDerivationsDisplayed, totalDerivationsDisplayedPrev]);

    const onEnableDerivation = async (index: number) => {
        enableDerivation({
            accountId: account.id,
            derivationIndex: index
        });
    };

    const onHideDerivation = async (index: number) => {
        hideDerivation({
            accountId: account.id,
            derivationIndex: index
        });
    };
    if (!balances) {
        return <SkeletonListDesktopAdaptive size={account.allAvailableDerivations.length} />;
    }

    const isLoading = isHideDerivationLoading || isEnableDerivationLoading;

    const canHide = account.derivations.length > 1;

    return (
        <ContentWrapper className={className} ref={ref}>
            <ListBlockStyled>
                <ListItem hover={false}>
                    <ListItemPayload>
                        <FirstLineContainer>
                            <Label2>{t('wallet_main')}</Label2>
                        </FirstLineContainer>
                        <ButtonsContainer>
                            <Button
                                onClick={() => recovery({ accountId: account.id })}
                                loading={isLoading}
                            >
                                <KeyIcon />
                            </Button>
                        </ButtonsContainer>
                    </ListItemPayload>
                </ListItem>
                {wallets!.map(derivation => {
                    const derivationIndex = derivation.index;
                    const isDerivationAdded = account.derivations.some(
                        d => d.index === derivationIndex
                    );
                    return (
                        <ListItem style={{ paddingLeft: 24 }} hover={false} key={derivation.index}>
                            <ListItemPayload>
                                <NameContainer>
                                    <WalletEmoji containerSize="24px" emoji={derivation.emoji} />
                                    <TextContainer>
                                        <FirstLineContainer>
                                            <Label2>{derivation.name}</Label2>
                                            <WalletIndexBadge>
                                                #{derivation.index + 1}
                                            </WalletIndexBadge>
                                        </FirstLineContainer>
                                        {/*<Body2Secondary>*/}
                                        {/*    {toShortValue(formatAddress(balance.address)) + ' '}·*/}
                                        {/*    {' ' + toFormattedTonBalance(balance.tonBalance)}*/}
                                        {/*    &nbsp;TON*/}
                                        {/*</Body2Secondary>*/}
                                    </TextContainer>
                                </NameContainer>
                                {isDerivationAdded ? (
                                    <ButtonsContainer>
                                       
                                        {canHide && (
                                            <Button
                                                onClick={() => onHideDerivation(derivationIndex)}
                                                loading={isLoading}
                                            >
                                                {t('hide')}
                                            </Button>
                                        )}
                                         <IconButtonTransparentBackgroundStyled
                                            onClick={() =>
                                                rename({ accountId: account.id, derivationIndex })
                                            }
                                        >
                                            <PencilIcon />
                                        </IconButtonTransparentBackgroundStyled>
                                         <Button
                                            onClick={() => recovery({ accountId: account.id, walletId: derivation.activeTonWalletId })}
                                            loading={isLoading}
                                        >
                                            <KeyIcon />
                                        </Button>
                                        
                                    </ButtonsContainer>
                                ) : (
                                    <ButtonsContainer>

                                        <Button
                                            primary
                                            onClick={() => onEnableDerivation(derivationIndex)}
                                            loading={isLoading}
                                        >
                                            {t('add')}
                                        </Button>
                                        <IconButtonTransparentBackgroundStyled
                                            onClick={() =>
                                                rename({ accountId: account.id, derivationIndex })
                                            }
                                        >
                                            <PencilIcon />
                                        </IconButtonTransparentBackgroundStyled>
                                        
                                        <Button
                                            onClick={() => recovery({ accountId: account.id, walletId: derivation.activeTonWalletId })}
                                            loading={isLoading}
                                        >
                                            <KeyIcon />
                                        </Button>
                                    </ButtonsContainer>
                                )}
                            </ListItemPayload>
                        </ListItem>
                    );
                })}
            </ListBlockStyled>
        </ContentWrapper>
    );
};

const MAMIndexesPageContentStyled = styled(MAMIndexesPageContent)`
    .mam-page-sticky-button-wrapper {
        margin: 0;
        position: sticky;
        bottom: 0;
    }
`;
