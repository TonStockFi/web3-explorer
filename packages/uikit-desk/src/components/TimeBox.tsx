import { View } from '@web3-explorer/uikit-view';

export default function TimeBox({ elapsed, imageSize }: { imageSize: number; elapsed: number }) {
    return (
        <View mb12 row>
            <View>{(elapsed / 1000).toFixed(2)} s</View>
            <View ml12>{(imageSize / 1000).toFixed(3)} k</View>
        </View>
    );
}
