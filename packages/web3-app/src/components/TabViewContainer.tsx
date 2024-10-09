import * as React from 'react';
import { CSSProperties } from 'react';
import Tab from '@web3-explorer/uikit-mui/dist/mui/Tab';
import Tabs from '@web3-explorer/uikit-mui/dist/mui/Tabs';
import { View } from '@web3-explorer/uikit-view';

export interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    style?: CSSProperties;
}

export function TabPanelView(props: TabPanelProps) {
    const { children, style, value, index, ...other } = props;
    return (
        <View
            w100p
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            sx={style}
            {...other}
        >
            {value === index && children}
        </View>
    );
}

export function a11yProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`
    };
}

export interface TabItem {
    title: string;
    icon?: React.ReactElement<unknown>;
    props?: any;
    disabled?: boolean;
    node: React.ElementType;
}

export default function ({
    tabs,
    topTabStyle,
    panelStyle,
    currentTabIndex,
    onChangeTabIndex
}: {
    panelStyle?: CSSProperties;
    topTabStyle?: CSSProperties;
    tabs: TabItem[];
    currentTabIndex: number;
    onChangeTabIndex: (index: number) => void;
}) {
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        onChangeTabIndex(newValue);
    };
    return (
        <View w100p h100p>
            <View w100p sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    variant="scrollable"
                    scrollButtons="auto"
                    value={currentTabIndex}
                    onChange={handleChange}
                    aria-label=""
                >
                    {tabs.map((tab: TabItem, index: number) => (
                        <Tab
                            icon={tab.icon}
                            disabled={!!tab.disabled}
                            key={index}
                            label={tab.title}
                            {...a11yProps(index)}
                            sx={topTabStyle}
                        />
                    ))}
                </Tabs>
            </View>
            {tabs.map((tab: TabItem, index: number) => {
                const Node = tab.node;
                return (
                    <TabPanelView
                        key={index}
                        value={currentTabIndex}
                        index={Number(index)}
                        style={{ ...panelStyle }}
                    >
                        <Node {...tab.props} />
                    </TabPanelView>
                );
            })}
        </View>
    );
}
