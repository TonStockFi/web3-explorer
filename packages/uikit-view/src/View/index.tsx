import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';

import { handleProps } from './utils';
import Prompt from '../components/Prompt';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ViewProps } from './types';
import { DebugView } from './DebugView';

export const View = (props: ViewProps) => {
    const { text, _D,_D0, json, empty, confirm, prompt, snackbar, textProps, hide, button, buttonProps, ...props_ } = props;
    if (hide) return null;
    if (_D !== undefined && _D0 === undefined) {
        // @ts-ignore
        return <>
            <Box {...handleProps(props_)} />
            <DebugView value={_D}/>
        </>;
    }
    if (button) {
        const {onClick,...props_1} = props_
        const p = handleProps(props_1);
        const { children, ...p1 } = p;
        return <Box {...p1} >
            <Button variant={'contained'} onClick={(e:any)=>{onClick && onClick(e)}} {...buttonProps}>{children || button}</Button>
        </Box>;
    }
    if (text) {
        const p = handleProps(props_);
        const { children, ...p1 } = p;
        return <Box {...p1} >
            <Typography sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}} color="inherit" component="div" {...textProps}>{children || text}</Typography>
        </Box>;
    }

    if (snackbar) {
        const { message, open, onClose, ...p1 } = snackbar;
        return <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={3000}
            onClose={onClose}
            message={message}
            open={open}
            {...p1}
        />;
    }
    if (prompt) {
        return <Prompt {...prompt} />;
    }

    if (confirm) {
        return <ConfirmationDialog {...confirm} />;
    }

    if (json !== undefined) {
        return <Box {...handleProps(props_)} >
            <Typography component="pre" sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                {JSON.stringify(json, null, 2)}
            </Typography>
        </Box>;
    }
    if (empty) {
        return <>{props.children}</>;
    }
    // @ts-ignore
    return <Box {...handleProps(props_)} />;
};
