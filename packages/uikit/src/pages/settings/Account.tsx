import { FC, useEffect, useState } from "react";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { InnerBody } from "../../components/Body";
import { DropDown } from "../../components/DropDown";
import { EllipsisIcon } from "../../components/Icon";
import { ColumnText, Divider } from "../../components/Layout";
import { ListBlock, ListItem, ListItemElement, ListItemPayload } from "../../components/List";
import { SkeletonListPayloadWithImage } from "../../components/Skeleton";
import { SubHeader } from "../../components/SubHeader";
import { Label1 } from "../../components/Text";
import { DeleteAccountNotification } from "../../components/settings/DeleteAccountNotification";
import { SetUpWalletIcon } from "../../components/settings/SettingsIcons";
import { RenameWalletNotification } from "../../components/settings/wallet-name/WalletNameNotification";
import { WalletEmoji } from "../../components/shared/emoji/WalletEmoji";
import { useTranslation } from "../../hooks/translation";
import { AppRoute, ImportRoute, SettingsRoute } from "../../libs/routes";
import { useAccountsState } from "../../state/wallet";
import { Account as AccountType } from "@tonkeeper/core/dist/entries/account";
import { useAccountLabel } from "../../hooks/accountUtils";
import { AccountsPager } from "../../components/desktop/aside/AsideAccountsMenu";
import { View } from "@web3-explorer/uikit-view";

const Row = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;

    width: 100%;
`;

const Icon = styled.span`
    display: flex;
    color: ${props => props.theme.iconSecondary};
`;

const WalletRow: FC<{
  account: AccountType;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
}> = ({ account, dragHandleProps }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [rename, setRename] = useState<boolean>(false);
  const [remove, setRemove] = useState<boolean>(false);

  const secondary = useAccountLabel(account);

  if (!account) {
    return <SkeletonListPayloadWithImage />;
  }

  return (
    <>
      <ListItemPayload>
        <Row>
          <WalletEmoji emoji={account.emoji} />
          <ColumnText noWrap text={account.name} secondary={secondary} />
          <DropDown
            payload={onClose => (
              <ListBlock margin={false} dropDown>
                <ListItem
                  dropDown
                  onClick={() => {
                    setRename(true);
                    onClose();
                  }}
                >
                  <ListItemPayload>
                    <Label1>{t("Rename")}</Label1>
                  </ListItemPayload>
                </ListItem>
                <Divider />
                {account.type === "mnemonic" && (
                  <ListItem
                    dropDown
                    onClick={() => {
                      navigate(
                        AppRoute.settings +
                        SettingsRoute.recovery +
                        `/${account.id}`
                      );
                    }}
                  >
                    <ListItemPayload>
                      <Label1>{t("settings_backup_seed")}</Label1>
                    </ListItemPayload>
                  </ListItem>
                )}

                {/*<ListItem*/}
                {/*    dropDown*/}
                {/*    onClick={() => {*/}
                {/*        setRemove(true);*/}
                {/*        onClose();*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <ListItemPayload>*/}
                {/*        <Label1>{t('settings_delete_account')}</Label1>*/}
                {/*    </ListItemPayload>*/}
                {/*</ListItem>*/}
              </ListBlock>
            )}
          >
            <Icon>
              <EllipsisIcon />
            </Icon>
          </DropDown>
        </Row>
      </ListItemPayload>
      <RenameWalletNotification
        account={rename ? account : undefined}
        handleClose={() => setRename(false)}
      />
      <DeleteAccountNotification
        account={remove ? account : undefined}
        handleClose={() => setRemove(false)}
      />
    </>
  );
};

export const Account = () => {
  const { t } = useTranslation();
  const accounts = useAccountsState();
  const total = accounts.length;
  const limit = 8;
  const [page, setPage] = useState(0);
  const accountsList = accounts.slice(page * limit, (page + 1) * limit);
  const navigate = useNavigate();

  return (
    <>
      <SubHeader title={t("Manage_wallets")} />
      <InnerBody>
        <View mb={24} row jSpaceBetween aCenter>
          <View
            button={t("balances_setup_wallet")}
            onClick={() => navigate(AppRoute.import + ImportRoute.createBatch)}
            buttonProps={{ size: "small", startIcon: <SetUpWalletIcon /> }}
          />
          <View w={180}>
            <AccountsPager total={total} limit={limit} page={page} setPage={(page: number) => setPage(page)} />
          </View>
        </View>
        <ListBlock>
          {accountsList.map((account) => (
            <ListItemElement
              key={account.id}
              ios={true}
              hover={false}
            >
              <WalletRow account={account} dragHandleProps={null} />
            </ListItemElement>
          ))}
        </ListBlock>
      </InnerBody>
    </>
  );
};
