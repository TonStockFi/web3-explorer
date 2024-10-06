import { ButtonProps } from '@mui/material/Button';
import { SnackbarProps } from '@mui/material/Snackbar';
import { TypographyProps } from '@mui/material/Typography';

import { BoxProps } from '@mui/material/Box';
import { SxProps, Theme } from '@mui/system';

export interface ConfirmationDialogProps {
    id: string;
    confirming?: boolean;
    titleIcon?: any;
    title?: string;
    confirmTxt?: string;
    content: string | any;
    keepMounted?: boolean;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface PromptProps {
    title: string;
    desc?: string;
    inputLabel?: string;
    onClose: () => void;
    onConfirm: (value: string) => Promise<boolean>;
    open?: boolean;
}

export interface UtilsProps {
    _D?:any;
    _D0?:any;
    bgColor?: string;
    red?: boolean;
    blue?: boolean;
    hide?: boolean;
    h100p?: boolean;
    wh100p?: boolean;
    wh?:number |string;
    h100vh?: boolean;
    w100p?: boolean;
    w100vw?: boolean;
    overflowHidden?: boolean;
    overflowYAuto?: boolean;
    w?: any;
    h?: any;
    x?: number;
    y?: number;
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
    opacity?: number;
    absolute?: boolean;
    abs?: boolean;
    rel?: boolean;
    relative?:boolean;
    absFull?: boolean;
    zIdx?: number;
    button?: string,
    buttonProps?: ButtonProps;
    text?: string,
    json?: object | Array<any> | null | undefined,
    textProps?: TypographyProps;
    snackbar?: SnackbarProps;
    prompt?: PromptProps;
    confirm?: ConfirmationDialogProps;
    empty?: boolean;
    displayNone?: boolean,
    onClick?: () => void;
}


export interface FlexProps {
    row?: boolean;
    column?: boolean;
    center?: boolean;
    jCenter?: boolean;
    aCenter?: boolean;
    aStart?: boolean;
    aEnd?: boolean;
    jSpaceAround?: boolean;
    jSpaceBetween?: boolean;
    jStart?: boolean;
    fWrap?: boolean;
    jEnd?: boolean;
}

export interface MarginProps {
    m12?: boolean;
    ml12?: boolean;
    mt12?: boolean;
    mr12?: boolean;
    mb12?: boolean;
    m?: any;
    mr?: number;
    ml?: number;
    mt?: number;
    mb?: number;
    mx?: number;
    my?: number;
}

export interface PaddingProps {
    p?: any;
    pr?: number;
    pl?: number;
    pt?: number;
    pb?: number;
    px?: number;
    py?: number;
    p12?: boolean;
    pl12?: boolean;
    pt12?: boolean;
    pr12?: boolean;
    pb12?: boolean;
    ph8?: boolean;
    pv8?: boolean;
}

//@ts-ignore
export interface ViewProps extends BoxProps, UtilsProps, FlexProps, MarginProps, PaddingProps {
    sx?: SxProps<Theme>;
}
