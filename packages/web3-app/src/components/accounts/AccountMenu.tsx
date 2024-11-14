import { DropDownContent, DropDownItem } from '@tonkeeper/uikit/dist/components/DropDown';
import { EllipsisIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { Label2 } from '@tonkeeper/uikit/dist/components/Text';
import { SelectDropDown } from '@tonkeeper/uikit/dist/components/fields/Select';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';

const Icon = styled.span`
    display: flex;
    color: ${props => props.theme.iconSecondary};
`;

const DropDownStyled = styled(SelectDropDown)`
    margin-left: auto;
    width: fit-content;
`;

const DropDownItemStyled = styled(DropDownItem)`
    &:not(:last-child) {
        border-bottom: 1px solid ${p => p.theme.separatorCommon};
    }
`;

const IconWrapper = styled.div`
    margin-left: auto;
    display: flex;
    color: ${p => p.theme.accentBlue};
`;

export const AccountMenu: FC<{
    options: { hide?: boolean; name: string; onClick: () => void; icon: ReactNode }[];
}> = ({ options }) => {
    return (
        <DropDownStyled
            right="0"
            top="0"
            payload={onClose => (
                <DropDownContent>
                    {options
                        .filter(row => !row.hide)
                        .map(option => (
                            <DropDownItemStyled
                                onClick={() => {
                                    onClose();
                                    option.onClick();
                                }}
                                isSelected={false}
                                key={option.name}
                            >
                                <Label2>{option.name}</Label2>
                                <IconWrapper>{option.icon}</IconWrapper>
                            </DropDownItemStyled>
                        ))}
                </DropDownContent>
            )}
        >
            <Icon>
                <EllipsisIcon />
            </Icon>
        </DropDownStyled>
    );
};
