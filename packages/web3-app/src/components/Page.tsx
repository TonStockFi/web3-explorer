import { View } from '@web3-explorer/uikit-view';
import { ReactNode } from 'react';
import { useTheme } from 'styled-components';

export function Page({
    header,
    full,
    onBack,
    title,
    children
}: {
    onBack?: () => void;
    title?: string;
    full?: boolean;
    header?: ReactNode;
    children: ReactNode;
}) {
    const theme = useTheme();
    return (
        <View wh100p userSelectNone flx bgColor={theme.backgroundBrowserActive}>
            <View flex1 column overflowHidden relative>
                <View hide={full} borderBox h={44} px={12} aCenter row jSpaceBetween>
                    <View row jStart aCenter hide={!(onBack || title)}>
                        <View hide={!onBack} mr12>
                            <View
                                onClick={onBack}
                                icon="Back"
                                iconButton={{
                                    size: 'small',
                                    sx: { borderRadius: '50%', color: theme.textPrimary }
                                }}
                                iconProps={{ fontSize: 'small' }}
                            />
                        </View>
                        <View hide={!title} text={title} textProps={{ component: 'h2' }} mr12 />
                    </View>
                    {header}
                </View>
                <View abs top={full ? 0 : 44} left0 right0 bottom0 borderBox>
                    {children}
                </View>
            </View>
        </View>
    );
}
