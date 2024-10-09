import * as React from 'react';
import { useState } from 'react';

import Dialog,{DialogActions,DialogContent,DialogTitle,DialogContentText} from '@web3-explorer/uikit-mui/dist/mui/Dialog';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';

import useMediaQuery from '@web3-explorer/uikit-mui/dist/mui/useMediaQuery';

import { useTheme } from '@web3-explorer/uikit-mui/dist/mui/styles';
import { PromptProps } from '../View/types';

export default function Prompt({
                                   open,
                                   inputLabel,
                                   desc,
                                   title,
                                   onClose,
                                   onConfirm
                               }: PromptProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [value, setValue] = useState('');
    const handleClose = () => {
        setValue('');
        onClose && onClose();
    };
    return (
        <React.Fragment>
            <Dialog
                open={!!open}
                fullScreen={fullScreen}
                maxWidth={'md'}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        const prompt_value = formJson.prompt_value;
                        const res = await onConfirm(prompt_value);
                        if (res) {
                            handleClose();
                        }
                    }
                }}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent sx={{ minWidth: fullScreen ? undefined : '360px' }}>
                    {
                        desc && <DialogContentText>desc</DialogContentText>
                    }
                    <Box>
                        <TextField
                            autoFocus
                            required
                            value={value}
                            margin="dense"
                            id="prompt_value"
                            name="prompt_value"
                            label={inputLabel || ''}
                            type="text"
                            fullWidth
                            onChange={e => {
                                setValue(e.target.value);
                            }}
                            variant="standard"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button type="submit">确定</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
