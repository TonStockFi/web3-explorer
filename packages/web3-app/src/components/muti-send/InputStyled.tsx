import { InputBlock, InputField } from '@tonkeeper/uikit/dist/components/fields/Input';
import styled from 'styled-components';
import {FC} from "react";

export const InputBlockStyled:any = styled(InputBlock)`
    min-height: unset;
    height: fit-content;
    padding: 0 12px;
    border-radius: ${p => p.theme.corner2xSmall};
    display: flex;
    align-items: center;
`;

export const InputFieldStyled:any = styled(InputField)`
    width: 100%;
    padding: 8px 0;
    height: 36px;
    box-sizing: content-box;
    font-family: ${p => p.theme.fontMono};
`;
