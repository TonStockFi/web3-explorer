import { useTheme } from 'styled-components';

import { Label2 } from '@tonkeeper/uikit/dist/components/Text';

import { View } from '@web3-explorer/uikit-view';

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
            <View wh={22} rowVCenter>
                <View
                    hide={page === 0}
                    iconSmall
                    icon={'ArrowLeft'}
                    iconButtonColor={theme.textPrimary}
                    iconButton={{
                        disabled: page === 0,
                        size: 'small'
                    }}
                    onClick={() => {
                        setPage(page - 1 < 0 ? 0 : page - 1);
                    }}
                />
            </View>
            <Label2>
                {page + 1} / {totalPages}
            </Label2>
            <View wh={22} rowVCenter>
                <View
                    iconSmall
                    hide={page + 1 >= totalPages}
                    icon={'ArrowRight'}
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
        </View>
    );
};
