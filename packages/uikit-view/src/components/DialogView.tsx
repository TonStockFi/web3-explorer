import React from 'react';
import { DialogViewProps } from '../View/types';

import Dialog,{DialogContent} from '@web3-explorer/uikit-mui/dist/mui/Dialog';

export function DialogView(props: DialogViewProps) {
    const { content, dialogProps } = props;

    return (
        <Dialog {...dialogProps}>
            <DialogContent sx={{ padding: 0, margin: 0 }}>{content}</DialogContent>
        </Dialog>
    );
}

export default DialogView;
