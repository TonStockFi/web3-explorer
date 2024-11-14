import { View } from '@web3-explorer/uikit-view';
import { useLocalStorageState } from '@web3-explorer/utils';
import { useTheme } from 'styled-components';
import { Page } from '../../components/Page';
import TabViewContainer from '../../components/TabViewContainer';
import ManagerClients from '../Manager/ManagerClients';
import { Color } from './Color';
import FeatureView from './FeatureView';
import { Icons } from './Icons';
import { TgWeb } from './TgWeb';

export default function () {
    const [currentTabIndex, setCurrentTabIndex] = useLocalStorageState('dev_currentTabIndex', 0);
    const tabs = [
        {
            title: 'Feature',
            node: FeatureView
        },
        {
            title: 'Telegram Web',
            node: TgWeb
        },
        {
            title: 'Wesocket Server',
            node: ManagerClients
        },
        {
            title: 'Icons',
            node: Icons
        },
        {
            title: 'Color',
            node: Color
        }
    ];
    const theme = useTheme();
    return (
        <Page full>
            <View pl12 row center h100p>
                <TabViewContainer
                    panelStyle={{ paddingTop: 2, height: 'calc(100vh - 115px)' }}
                    onChangeTabIndex={setCurrentTabIndex}
                    tabs={tabs}
                    topTabStyle={{ color: theme.textPrimary }}
                    currentTabIndex={currentTabIndex}
                />
            </View>
        </Page>
    );
}
