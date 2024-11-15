import { FC } from 'react';
import styled from 'styled-components';

export const SpinnerIcon: FC<{ className?: string }> = ({ className }) => (
    <StyledSpinner viewBox="0 0 50 50" width="1em" height="1em" className={className}>
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
    </StyledSpinner>
);

const StyledSpinner = styled.svg`
    animation: rotate 1s linear infinite;
    width: 1em;
    height: 1em;

    & .path {
        stroke: currentColor;
        stroke-linecap: round;
        animation: dash 1.5s ease-in-out infinite;
    }

    @keyframes rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes dash {
        0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
        }
        100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
        }
    }
`;
