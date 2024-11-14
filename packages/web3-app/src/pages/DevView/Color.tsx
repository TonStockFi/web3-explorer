import { darkTheme } from '@tonkeeper/uikit/dist/styles/darkTheme';
import { defaultTheme } from '@tonkeeper/uikit/dist/styles/defaultTheme';
import { lightTheme } from '@tonkeeper/uikit/dist/styles/lightTheme';
import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';

export function Color() {
    const themeMap = [defaultTheme, darkTheme, lightTheme];
    const [themeIndex, setThemeIndex] = useState(0);
    const theme = themeMap[themeIndex];
    return (
        <View wh100p flex1 column overflowYAuto>
            <View row mb12>
                <View
                    mr12
                    disabled={themeIndex === 0}
                    onClick={() => {
                        setThemeIndex(0);
                    }}
                    button="defaultTheme"
                    buttonVariant="contained"
                />

                <View
                    mr12
                    disabled={themeIndex === 1}
                    onClick={() => {
                        setThemeIndex(1);
                    }}
                    button="darkTheme"
                    buttonVariant="contained"
                />

                <View
                    mr12
                    disabled={themeIndex === 2}
                    onClick={() => {
                        setThemeIndex(2);
                    }}
                    button="lightTheme"
                    buttonVariant="contained"
                />
            </View>
            <View row fWrap bgColor="rgba(0,0,0,0.1)">
                {Object.keys(theme).map(key => {
                    //@ts-ignore
                    const v = theme[key];
                    if (!v) return null;
                    return (
                        <View mr12 m12 rowVCenter w={320} row>
                            <View
                                hide={v.indexOf('#') !== 0 && v.indexOf('rgba') !== 0}
                                borderRadius={8}
                                mr12
                                wh={44}
                                tips={v}
                                bgColor={v}
                            />
                            <View
                                hide={v.indexOf('linear-gradient') !== 0}
                                borderRadius={8}
                                mr12
                                wh={44}
                                tips={v}
                                sx={{ background: v }}
                            />
                            <View>
                                <View useSelectText text={key} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
