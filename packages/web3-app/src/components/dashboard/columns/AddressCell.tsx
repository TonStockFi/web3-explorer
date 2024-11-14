import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import { FC } from 'react';
import { formatAddress, toShortValue } from '@tonkeeper/core/dist/utils/common';
import { Network } from '@tonkeeper/core/dist/entries/network';
import styled from 'styled-components';
import { CopyButton } from '@tonkeeper/uikit/dist/components/CopyButton';

const AddressCellStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const AddressCell: FC<{ raw: string; network: Network }> = ({ raw, network }) => {
    const userFriendlyAddress = formatAddress(raw, network);
    return (
        <AddressCellStyled>
            <Body2>{toShortValue(userFriendlyAddress)}</Body2>
            <CopyButton content={userFriendlyAddress} />
        </AddressCellStyled>
    );
};
