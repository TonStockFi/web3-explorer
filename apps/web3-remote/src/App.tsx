import './App.css';
import MobileDeviceApp from '@web3-explorer/uikit-desk/dist/view/Device/MobileDeviceApp';
import { View } from '@web3-explorer/uikit-view';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

function App() {
    return (
        <View sx={{height:"100vh",width:"100vw",overflow:"hidden"}}>
            <MobileDeviceApp />
        </View>
    )
}

export default App;
