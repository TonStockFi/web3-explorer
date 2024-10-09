import { TonKeychainRoot } from "@ton-keychain/core";
import { useAppContext } from "@tonkeeper/uikit/dist/hooks/appContext";
import TabViewContainer from "../../components/TabViewContainer";
import { useLocalStorageState } from "@web3-explorer/uikit-mui";
import Mnemonic from "@web3-explorer/lib-crypto/dist/Mnemonic";
import { View } from "@web3-explorer/uikit-view";
import { Sites, TgWeb, WebView1, WebView3 } from "./DevWebview";

import {
  createStandardTonAccountByMnemonic,
  getStandardTonWalletVersions
} from '@tonkeeper/core/dist/service/walletService'
import { WalletId, WalletVersion } from '@tonkeeper/core/dist/entries/wallet';

import {
    useAccountsState,
    useActiveAccount,
    useCreateAccountMAM,
    useCreateAccountMnemonic, useCreateMAMAccountDerivation, useMutateAccountActiveDerivation
} from '@tonkeeper/uikit/dist/state/wallet';
import { useState } from "react";
import { useProcessMnemonic } from "@tonkeeper/uikit/dist/pages/import/ImportExistingWallet";
import { useAppSdk } from "@tonkeeper/uikit/dist/hooks/appSdk";

const FeatureView = () => {
  const { defaultWalletVersion } = useAppContext();
  const { mutateAsync: createWalletsAsync } = useCreateAccountMnemonic();

  const account = useActiveAccount();

    const { mutate: createDerivation, isLoading: isCreatingDerivationLoading } =
        useCreateMAMAccountDerivation();

    const { mutateAsync: createAccountMam, isLoading: isCreatingAccountMam } =
    useCreateAccountMAM();
  const { mutateAsync: processMnemonic, isLoading: isProcessMnemonic } = useProcessMnemonic();

    const { mutateAsync: selectDerivation, isLoading: isSelectDerivationLoading } =
        useMutateAccountActiveDerivation();
  const accounts = useAccountsState();
  const context = useAppContext();
  const [debug, setDebug] = useState<any>(null);
  const sdk = useAppSdk();
  return (
    <View >
      <View row>
        <View
          mb12
          mr12
          button="accounts"
          onClick={async () => {
            setDebug({ account,accounts });
          }}
        />
          <View
              mb12
              mr12
              button="createDerivation"
              onClick={async () => {
                  if(account.type !== 'mam'){
                      setDebug(["account type is not mam"])
                      return;
                  }
                  createDerivation({
                      accountId: account.id
                  });
              }}
          />
          <View
              mb12
              mr12
              button="selectDerivation"
              onClick={async () => {
                  if(account.type !== 'mam'){
                      setDebug(["account type is not mam"])
                      return;
                  }
                  await selectDerivation({
                      accountId: account.id,
                      derivationIndex:2
                  });

              }}
          />

        <View
          mb12
          mr12
          button="ImportExistingWallet"
          onClick={async () => {
            let mnemonic = "agree strike regret move busy miss connect feature shoot rent summer casual first bulb crime radio napkin again agent deny skin baby cradle position".split(" ");
            const m = new Mnemonic();
            const _account = await createStandardTonAccountByMnemonic(context, sdk.storage, m.getWordsArray(), {
              auth: {
                kind: 'keychain'
              },
              versions: [
                WalletVersion.V5R1,
              ]
            });
            const res = await createWalletsAsync({
              mnemonic:m.getWordsArray(),
              versions:[WalletVersion.V5R1],
              selectAccount: true
            })
            setDebug({ m:m.getWords(),_account,res });
          }}
        />
        <View
          mb12
          mr12
          button="createMamWalletsAsync"
          onClick={async () => {
            // const { mnemonic } = await TonKeychainRoot.generate();
            const mnemonic = "feature glue okay buyer fashion offer wrestle gun frame chat warm wine chaos decade wide federal canvas sibling company mandate gain weasel stand brass".split(" ")
            const account = await createAccountMam({
              mnemonic,
              selectedDerivations: [0,1,2,3],
              selectAccount: true
            });
            setDebug({ mnemonic:mnemonic.join(" ") ,account});
          }}
        />
      </View>
      <View row>
        <View
          mb12
          mr12
          button="Gen MAM Mnemonic"
          onClick={async () => {
            const res = await TonKeychainRoot.generate();
            let mneArray = res.mnemonic;
            mneArray = "agree strike regret move busy miss connect feature shoot rent summer casual first bulb crime radio napkin again agent deny skin baby cradle position".split(" ");

            const isValidMnemonic = await TonKeychainRoot.isValidMnemonic(mneArray);
            const isValidMnemonicLegacy = await TonKeychainRoot.isValidMnemonicLegacy(mneArray);
            setDebug({ mnemonic: res.mnemonic, isValidMnemonicLegacy, isValidMnemonic });
          }}
        />
        <View
          mb12
          mr12
          button="Gen Wallet"
          onClick={async () => {
            // const m = await mnemonicNew(12)
            // const ifMnemonicIsMAM = await checkIfMnemonicIsMAM(m)
            // console.log({ifMnemonicIsMAM})
            // const account = await createWalletsAsync({
            //   mnemonic:m,
            //   versions: [defaultWalletVersion],
            // })
          }}
        />
        <View
          mb12
          mr12
          button="storage-clear"
          onClick={async () => {
            await window.backgroundApi.message({
              king: "storage-clear"
            });
            location.reload();
          }}
        />
      </View>
      <View wh100p>
        <View h={800} overflowYAuto>
          <View json={debug}></View>
        </View>
      </View>
    </View>
  );
};

export default function() {
  const [currentTabIndex, setCurrentTabIndex] = useLocalStorageState("dev_currentTabIndex", 0);
  const tabs = [
    {
      title: "Feature",
      node: FeatureView
    },
    {
      title: "Tg Web",
      node: TgWeb
    },
    {
      title: "Sites",
      node: Sites
    },

    {
      title: "Preload",
      node: WebView3
    },
    {
      title: "Ton Connect",
      node: WebView1
    }
  ];

  return (
    <View zIdx={1001} absFull left={64} pl12 wh100p>
      <View w100p row center mt12 h100p>
        <TabViewContainer
          panelStyle={{ paddingTop: 2 }}
          onChangeTabIndex={setCurrentTabIndex}
          tabs={tabs}
          topTabStyle={{color:"white"}}
          currentTabIndex={currentTabIndex}
        />
      </View>
    </View>
  );
}
