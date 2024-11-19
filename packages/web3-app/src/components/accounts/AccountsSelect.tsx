import { Account } from '@tonkeeper/core/dist/entries/account';
import { DropDown } from '@tonkeeper/uikit/dist/components/DropDown';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { SwitchIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { WalletEmoji } from '@tonkeeper/uikit/dist/components/shared/emoji/WalletEmoji';
import { Body3, Label2 } from '@tonkeeper/uikit/dist/components/Text';
import { View } from '@web3-explorer/uikit-view';
import { FC } from 'react';
import styled, { useTheme } from 'styled-components';

const DropDownPayload = styled.div`
    background-color: ${props => props.theme.backgroundContentAttention};
`;

const DropDownWrapper = styled.div`
    .drop-down-container {
        z-index: 100;
        top: calc(100% + 8px);
        left: 0;
    }
`;

const MenuItem = styled.button`
    width: 100%;
    text-align: start;
    align-items: center;
    padding: 0.5rem 0.75rem;
    display: flex;
    gap: 0.75rem;
    cursor: pointer;

    transition: background-color 0.15s ease-in-out;

    &:hover {
        background-color: ${p => p.theme.backgroundHighlighted};
    }
`;

const MenuItemText = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-overflow: ellipsis;

    > ${Body3} {
        color: ${p => p.theme.textSecondary};
    }
`;

const Divider = styled.div`
    background-color: ${p => p.theme.separatorCommon};
    height: 1px;
    width: 100%;
`;

export const AccountsSelect: FC<{
    accounts: Account[];
    account: Account;
    onChange: (account: Account) => void;
}> = ({ account, accounts, onChange }) => {
    const theme = useTheme();
    return (
        <DropDownWrapper>
            <DropDown
                containerClassName="drop-down-container"
                payload={onClose => (
                    <DropDownPayload>
                        <AccountSelectBody
                            accounts={accounts}
                            onChange={val => {
                                onChange(val);
                                onClose();
                            }}
                        />
                    </DropDownPayload>
                )}
            >
                <Button
                    secondary
                    size="small"
                    style={{ backgroundColor: theme.backgroundHighlighted }}
                >
                    <View center>
                        <WalletEmoji
                            emoji={account.emoji.substring(0, 2)}
                            emojiSize="18px"
                            containerSize="18px"
                        />
                    </View>
                    {account.name}
                    <SwitchIcon />
                </Button>
            </DropDown>
        </DropDownWrapper>
    );
};

const AccountSelectBody: FC<{ accounts: Account[]; onChange: (account: Account) => void }> = ({
    accounts,
    onChange
}) => {
    return (
        <>
            {accounts.map(account => {
                return (
                    <>
                        <Divider />
                        <MenuItem onClick={() => onChange(account)}>
                            <View text={account.emoji.substring(0, 2)} />
                            <MenuItemText>
                                <Label2>{account.name}</Label2>
                            </MenuItemText>
                        </MenuItem>
                    </>
                );
            })}
        </>
    );
};
