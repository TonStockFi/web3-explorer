import styled, { useTheme } from 'styled-components';

import { Label2 } from '@tonkeeper/uikit/dist/components/Text';

import { View } from '@web3-explorer/uikit-view';

const IconWrapper = styled.div`
    color: ${p => p.theme.iconSecondary};
    height: fit-content;

    > svg {
        display: block;
    }
`;

export const AccountsPager = ({
    total,
    page,
    limit,
    setPage
}: {
    total: number;
    page: number;
    limit: number;
    setPage: (page: number) => void;
}) => {
    const theme = useTheme();
    if (total <= limit) {
        return null;
    }
    const totalPages = Math.ceil(total / limit);

    return (
        <View w100p row jSpaceBetween aCenter px={6} userSelectNone>
            <View
                iconSmall
                icon="ArrowLeft"
                iconButtonColor={theme.textPrimary}
                iconButton={{
                    disabled: page === 0,
                    size: 'small'
                }}
                onClick={() => {
                    setPage(page - 1 < 0 ? 0 : page - 1);
                }}
            />
            <Label2>
                {page + 1} / {totalPages}
            </Label2>
            <View
                iconSmall
                icon="ArrowRight"
                iconButtonColor={theme.textPrimary}
                iconButton={{
                    disabled: page + 1 >= totalPages,
                    size: 'small'
                }}
                onClick={() => {
                    if (page + 1 < totalPages) {
                        setPage(page + 1);
                    }
                }}
            />
        </View>
    );
};
