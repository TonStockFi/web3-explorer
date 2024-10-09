import React from 'react';
import Box from '@web3-explorer/uikit-mui/dist/mui/Box';
import Dialog,{DialogActions,DialogContent,DialogTitle} from '@web3-explorer/uikit-mui/dist/mui/Dialog';
import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import Stack from '@web3-explorer/uikit-mui/dist/mui/Stack';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';

import { ConfirmationDialogProps } from '../View/types';

export function ConfirmationDialog(props: ConfirmationDialogProps) {
    const {
        onCancel,
        confirming,
        confirmTxt,
        titleIcon,
        onConfirm,
        cancelTxt,
        content,
        title,
        open,
        ...other
    } = props;

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: 360, maxHeight: 435 } }}
            maxWidth="xs"
            open={open}
            {...other}
        >
            {title && (
                <DialogTitle>
                    {titleIcon ? (
                        <Stack direction="row" spacing={1}>
                            <Box>{titleIcon}</Box>
                            <Typography>{title}</Typography>
                        </Stack>
                    ) : (
                        <Typography>{title}</Typography>
                    )}
                </DialogTitle>
            )}

            <DialogContent dividers>{typeof content === 'string' ?
                <Typography>{content}</Typography> : content}</DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>
                    {cancelTxt ? cancelTxt : 'Cancel'}
                </Button>
                {
                    onConfirm && <Button disabled={confirming} onClick={onConfirm}>
                      {confirmTxt ? confirmTxt : 'OK'}
                  </Button>
                }

            </DialogActions>
        </Dialog>
    );
}

export default ConfirmationDialog;
