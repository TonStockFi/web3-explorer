import React, { LegacyRef, Ref } from 'react';
import { DevBoxProps } from './DevBoxWrap';
import { a } from 'vite/dist/node/types.d-aGj9QkWt';

export interface BoxPaddingProps {
    p10?: boolean;
    pr12?: boolean;
    pl12?: boolean;
    pt12?: boolean;
    pb12?: boolean;
}

export interface BoxMarginProps {
    m10?: boolean;
    mb?: number | string;
    mt?: number | string;
    mr?: number | string;
    mr12?: boolean;
    ml12?: boolean;
    mt12?: boolean;
    mb12?: boolean;
}

export interface BoxUtilsProps {
    red?: boolean;
    blue?: boolean;
    yellow?: boolean;
    wh?: number | string;
    center?: boolean;
    cursor?: 'pointer' | 'auto';
    row?: boolean;
    column?: boolean;
    flex?: boolean | number | string;
}

export interface CSSPropertiesProps {
    margin?: number | string;
    padding?: number | string;
    backgroundColor?: string;
    userSelect?: 'none' | 'text';
    borderRadius?: string | number;
    transition?: string | 'opacity 0.15s ease-in-out';
    opacity?: number;
    width?: number | string;
    height?: number | string;
    zIndex?: number;
    overflow?: 'hidden' | 'auto';
    overflowX?: 'hidden' | 'auto';
    overflowY?: 'hidden' | 'auto';
    position?: 'absolute' | 'relative' | 'fixed';
    inset?: number | string;
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    textAlign?: 'center' | 'left' | 'right';
    display?: 'inline' | 'flex' | 'block' | 'none' | string;
}
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string | number;
    type?: string;
    labelWidth?: number;
    min?: string | number;
    step?: string | number;
}

export interface BoxProps
    extends CSSPropertiesProps,
        BoxUtilsProps,
        BoxMarginProps,
        BoxPaddingProps {
    hide?: boolean;
    children?: React.ReactNode;
    text?: string;
    devBox?: DevBoxProps;
    onClick?: (e?: any) => void;
    onMouseMove?: (e?: any) => void;
    onChange?: (text: string | any, e?: any) => void;
    style?: React.CSSProperties;
    ref?: Ref<HTMLDivElement> | LegacyRef<HTMLButtonElement> | any;
    button?: boolean;
    selected?: string;
    select?: { value: string; text?: string }[];

    input?: CustomInputProps;
}
