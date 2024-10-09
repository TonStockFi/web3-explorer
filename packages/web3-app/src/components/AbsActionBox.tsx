import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import { View } from '@web3-explorer/uikit-view';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function AbsActionBox({ onClose }: { onClose?: () => void }) {
    return (
        <View absolute top={4} left={10} zIdx={1002}>
            <IconButton onClick={onClose} aria-label="close">
                <ArrowBackIcon sx={{ color: 'primary' }} fontSize="inherit" />
            </IconButton>
        </View>
    );
}
