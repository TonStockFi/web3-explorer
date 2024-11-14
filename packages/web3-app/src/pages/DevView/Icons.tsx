import { IconsMap } from '@web3-explorer/uikit-mui/dist/mui/Icons';
import { View } from '@web3-explorer/uikit-view';
import { ImageIcon, ImageIconMap } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';

export function Icons() {
    const keys = Object.keys(IconsMap);
    const keys1 = Object.keys(ImageIconMap);

    return (
        <View wh100p flex1 overflowYAuto column>
            <View row fWrap>
                {keys1.map(key => {
                    return (
                        <View column mr12 m12 center w={80}>
                            <ImageIcon icon={'icon_' + key} size={44} />
                            <View mt={16}>
                                <View textFontSize="0.8rem" useSelectText text={key} />
                            </View>
                        </View>
                    );
                })}
            </View>
            <View row mb12 fWrap>
                {keys.map(key => {
                    return (
                        <View column mr12 m12 center w={100}>
                            <View wh={44} icon={key} />
                            <View mt={16}>
                                <View textFontSize="0.8rem" useSelectText text={key} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
