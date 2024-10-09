import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AppRoute, SettingsRoute } from '../../libs/routes';
import { DevSettings } from '../../pages/settings/Dev';
import { FiatCurrency } from '../../pages/settings/FiatCurrency';
import { Localization } from '../../pages/settings/Localization';
import { DesktopManageAccountsPage } from '../settings/DesktopManageWalletsSettings';

const OldSettingsLayoutWrapper = styled.div`
    padding-top: 64px;
    position: relative;

    & .settings-header-back-button {
        display: none;
    }
`;

const OldSettingsLayout = () => {
    return (
        <OldSettingsLayoutWrapper>
            <Outlet />
        </OldSettingsLayoutWrapper>
    );
};

export const DesktopPreferencesRouting = () => {
    return (
        <Routes>
            <Route element={<OldSettingsLayout />}>
                <Route path={SettingsRoute.localization} element={<Localization />} />
                {/* <Route path={SettingsRoute.legal} element={<Legal />} /> */}
                <Route path={SettingsRoute.dev} element={<DevSettings />} />
                <Route path={SettingsRoute.fiat} element={<FiatCurrency />} />
                {/* <Route path={SettingsRoute.notification} element={<Notifications />} /> */}
                {/* <Route path={any(SettingsRoute.recovery)} element={<NavigateToRecovery />} /> */}
                {/* <Route
                    path={SettingsRoute.version}
                    element={
                        <Navigate to={AppRoute.walletSettings + WalletSettingsRoute.version} />
                    }
                /> */}
                {/* <Route
                    path={SettingsRoute.jettons}
                    element={
                        <Navigate to={AppRoute.walletSettings + WalletSettingsRoute.jettons} />
                    }
                /> */}
                {/* <Route path={SettingsRoute.security} element={<SecuritySettings />} /> */}
                {/* <Route path={SettingsRoute.country} element={<CountrySettings />} /> */}
                {/* <Route path={SettingsRoute.pro} element={<ProSettings />} /> */}
                <Route path="*" element={<Navigate to={'.' + SettingsRoute.account} replace />} />
            </Route>
            <Route path={SettingsRoute.account} element={<DesktopManageAccountsPage />} />
        </Routes>
    );
};

const NavigateToRecovery = () => {
    const location = useLocation();

    const newPath = location.pathname.replace(AppRoute.settings, AppRoute.walletSettings);

    return <Navigate to={{ pathname: newPath, search: location.search }} replace={true} />;
};
