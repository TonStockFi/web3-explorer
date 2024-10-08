import styled from 'styled-components';
import { hexToRGBA } from '../../libs/css';

export const AsideMenuItem = styled.button<{ isSelected: boolean }>`
    background: ${p => (p.isSelected ? p.theme.backgroundContentTint : p.theme.backgroundContent)};
    border-radius: ${p => p.theme.corner2xSmall};

    padding: 6px 10px;
    width: 100%;
    height: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 10px;

    & > * {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }

    transition: background-color 0.15s ease-in-out;

    &:hover {
        background: ${p => hexToRGBA(p.theme.backgroundContentTint, 0.56)};
    }
`;

export const AsideMenuIconItem = styled.button<{ disabled: boolean }>`
    background: ${p => p.theme.backgroundContent};
    border-radius: ${p => p.theme.corner2xSmall};
    width: 24px;
    height: 24px;
    cursor: ${p => p.disabled ? "unset":"pointer"};
    display: flex;
    align-items: center;
    justify-content: center;
    & > * {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
    }
    transition: background-color 0.15s ease-in-out;
    &:hover {
        background: ${p => p.disabled ? undefined : hexToRGBA(p.theme.backgroundContentTint, 0.56)};
    }
`;


