import { DashboardTable } from '@tonkeeper/uikit/dist/components/dashboard/DashboardTable';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { DesktopDashboardHeader } from '../../components/dashboard/DesktopDashboardHeader';
import { Page } from '../../components/Page';
export const desktopHeaderContainerHeight = '69px';

const PageWrapper = styled.div`
    overflow: auto;
    position: relative;
    height: calc(100% - ${desktopHeaderContainerHeight});
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const DashboardPage: FC<{ onCloseDashBoard?: () => void }> = ({ onCloseDashBoard }) => {
    const { t } = useTranslation();

    return (
        <Page full>
            <DesktopDashboardHeader />
            <PageWrapper>
                <DashboardTable />
            </PageWrapper>
        </Page>
    );
};

export default DashboardPage;
