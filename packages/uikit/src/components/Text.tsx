import styled, { css } from 'styled-components';

export const H1 = styled.h1`
    font-style: normal;
    font-weight: 700;
    font-size: 32px;
    line-height: 40px;
    margin: 0;
`;

export const Title = styled(H1)`
    margin: 1rem 0;
`;

export const H2 = styled.h2`
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    margin: 0 0 0.25rem;
`;

export const H2Responsive = styled(H2)`
    user-select: none;

    ${p => p.theme.displayType === 'full-width' && Label2Class}
    ${p =>
        p.theme.displayType === 'full-width' &&
        css`
            margin-bottom: 4px;
        `}
`;

export const H3 = styled.h3`
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;
    margin: 0 0 0.25rem;

    user-select: none;
`;

export const Label1 = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
`;

export const Label2Class = css`
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
`;

export const Label2 = styled.span`
    ${Label2Class}
`;

export const Label3Class = css`
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
`;

export const Label3 = styled.span`
    ${Label3Class}
`;

export const Label4 = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 10px;
    line-height: 14px;
`;

export const Body1 = styled.span`
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
`;

export const Body2Class = css`
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
`;

export const Body2 = styled.span`
    ${Body2Class}
`;

export const Body3Class = css`
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
`;

export const Body3 = styled.span`
    ${Body3Class}
`;

export const Num2Class = css`
    font-style: normal;
    font-weight: 600;
    font-size: 28px;
    line-height: 36px;
`;

export const Num2 = styled.span`
    ${Num2Class}
`;

export const Num3 = styled.span`
    font-style: normal;
    font-weight: 510;
    font-size: 24px;
    line-height: 32px;
`;

export const Mono = styled.span`
    font-family: ${p => p.theme.fontMono};
`;

export const TextEllipsis = css`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export const NoSelectText = css`
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;