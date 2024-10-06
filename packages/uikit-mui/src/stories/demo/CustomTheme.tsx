import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { View } from '@web3-explorer/uikit-view';
import Box from '@mui/material/Box';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background:{
            default:"red"
        },
        text:{
            primary:"blue"
        }
    },
});

export default function CustomTheme() {
    return <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <View row>
            <View mr12 bgColor={"background.default"} sx={{color:"text.primary"}}>
                View
            </View>
            <Box sx={{color:"text.secondary",bgcolor:"background.default"}}>
                Box
            </Box>
        </View>
    </ThemeProvider>
}
