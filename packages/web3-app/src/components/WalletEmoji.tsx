import { View } from '@web3-explorer/uikit-view';
import { FC } from 'react';

export const WalletEmoji: FC<{
    emoji?: string;
    emojiSize?: string;
    containerSize?: string;
    className?: string;
}> = ({ emoji, className, emojiSize, containerSize }) => {
    return (
        <View
            center
            wh={containerSize || '32px'}
            sx={{
                maxHeight: containerSize || '32px',
                maxWidth: containerSize || '32px',
                fontSize: emojiSize || '20px'
            }}
        >
            {emoji}
        </View>
    );
};
