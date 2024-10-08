import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../../../hooks/appContext';
import { useTranslation } from '../../../hooks/translation';
import { getCountryName, getLanguageName } from '../../../libs/common';
import { hexToRGBA } from '../../../libs/css';
import { AppRoute, SettingsRoute } from '../../../libs/routes';
import { useCountrySetting } from '../../../state/country';
import { BankIcon, CodeIcon, GlobeIcon, PlaceIcon, SlidersIcon } from '../../Icon';
import { AsideMenuItem } from '../../shared/AsideItem';
import { Skeleton } from '../../shared/Skeleton';
import { Body2, Label2 } from '../../Text';

const PreferencesAsideContainer = styled.div`
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-right: 1px solid ${p => p.theme.backgroundContentAttention};
    background: ${p => hexToRGBA(p.theme.backgroundContent, 0.56)};

    a {
        text-decoration: unset;
        color: unset;
    }

    * {
        user-select: none;
    }
`;

const AsideMenuItemStyled = styled(AsideMenuItem)`
    background: ${p => (p.isSelected ? p.theme.backgroundContentTint : 'unset')};
    padding-right: 50px;

    svg {
        color: ${p => p.theme.iconSecondary};
    }
`;

const AsideMenuItemLarge = styled(AsideMenuItemStyled)`
    height: 48px;
    max-height: 48px;
`;

const AsideMenuItemLargeBody = styled.div`
    display: flex;
    flex-direction: column;
    text-align: start;

    ${Body2} {
        color: ${p => p.theme.textSecondary};
    }
`;

const AsideMenuItemsBlock = styled.div`
    padding: 0.5rem;
    margin-top: 1rem;
`;

export const PreferencesAsideMenu = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const isCoinPageOpened = location.pathname.startsWith(AppRoute.coins);
    const isAccountOpened = location.pathname.startsWith(SettingsRoute.account);
    const { fiat } = useAppContext();
    return (
        <PreferencesAsideContainer>
            <AsideMenuItemsBlock>
                <NavLink to={AppRoute.settings + SettingsRoute.account}>
                    {({ isActive }) => (
                        <AsideMenuItemStyled
                            isSelected={isActive || isAccountOpened || isCoinPageOpened}
                        >
                            <SlidersIcon />
                            <Label2>{t('Manage_wallets')}</Label2>
                        </AsideMenuItemStyled>
                    )}
                </NavLink>
            </AsideMenuItemsBlock>
            <AsideMenuItemsBlock>
                <NavLink to={AppRoute.settings + SettingsRoute.localization}>
                    {({ isActive }) => (
                        <AsideMenuItemLarge isSelected={isActive}>
                            <GlobeIcon />
                            <AsideMenuItemLargeBody>
                                <Label2>{t('Localization')}</Label2>
                                <Body2>{getLanguageName(i18n.language)}</Body2>
                            </AsideMenuItemLargeBody>
                        </AsideMenuItemLarge>
                    )}
                </NavLink>
                <NavLink to={AppRoute.settings + SettingsRoute.fiat}>
                    {({ isActive }) => (
                        <AsideMenuItemLarge isSelected={isActive}>
                            <BankIcon />
                            <AsideMenuItemLargeBody>
                                <Label2>{t('settings_primary_currency')}</Label2>
                                <Body2>{fiat}</Body2>
                            </AsideMenuItemLargeBody>
                        </AsideMenuItemLarge>
                    )}
                </NavLink>
            </AsideMenuItemsBlock>
            <AsideMenuItemsBlock>
                <NavLink to={AppRoute.settings + SettingsRoute.dev}>
                    {({ isActive }) => (
                        <AsideMenuItemStyled isSelected={isActive}>
                            <CodeIcon />
                            <Label2>{t('preferences_aside_dev_menu')}</Label2>
                        </AsideMenuItemStyled>
                    )}
                </NavLink>
            </AsideMenuItemsBlock>
        </PreferencesAsideContainer>
    );
};
