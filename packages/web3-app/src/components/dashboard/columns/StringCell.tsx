import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import { FC } from 'react';

export const StringCell: FC<{ value: string }> = ({ value }) => {
    return <Body2>{value}</Body2>;
};
