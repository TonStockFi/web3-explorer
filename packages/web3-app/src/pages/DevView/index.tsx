import TabViewContainer from '@web3-explorer/uikit-desk/dist/components/TabViewContainer';
import { useLocalStorageState } from '@web3-explorer/uikit-mui';
import { View } from '@web3-explorer/uikit-view';
import { Sites, TgWeb, WebView1, WebView3 } from './DevWebview';
import { useAppContext } from "@tonkeeper/uikit/dist/hooks/appContext";
import { mnemonicNew } from "@ton/crypto";
import { useState } from "react";
import {
  useCheckIfMnemonicIsMAM,
  useCreateAccountMAM,
  useCreateAccountMnemonic
} from "@tonkeeper/uikit/dist/state/wallet";

const FeatureView = () => {
  const { defaultWalletVersion } = useAppContext();
  const { mutateAsync: createWalletsAsync } = useCreateAccountMnemonic();

  const { mutateAsync: createAccountMam, isLoading: isCreatingAccountMam } =
    useCreateAccountMAM();
  const { mutateAsync: checkIfMnemonicIsMAM, isLoading: isCheckingIfMnemonicIsMAM } =
    useCheckIfMnemonicIsMAM();
  const [mne, setMne] = useState<any>(null);
  return (
    <View _D={{mne}}>
        <View row>
          <View
            mb12
            mr12
            button="Gen Wallet"
            onClick={async () => {
              const m = await mnemonicNew(12)
              const ifMnemonicIsMAM = await checkIfMnemonicIsMAM(m)
              console.log({ifMnemonicIsMAM})
              const account = await createWalletsAsync({
                mnemonic:m,
                versions: [defaultWalletVersion],
              })
              setMne({account})
            }}
          />
          <View
            mb12
            mr12
            button="storage-clear"
            onClick={async () => {
              await window.backgroundApi.message({
                king:"storage-clear"
              })
              location.reload()
            }}
          />
        </View>
    </View>
  )
}

export default function () {
    const [currentTabIndex, setCurrentTabIndex] = useLocalStorageState('dev_currentTabIndex', 0);
    const tabs = [
        {
            title: "Feature",
            node: FeatureView
        },
        {
            title: 'Tg Web',
            node: TgWeb
        },
        {
            title: 'Sites',
            node: Sites
        },

        {
            title: 'Preload',
            node: WebView3
        },
        {
            title: 'Ton Connect',
            node: WebView1
        }
    ];
    return (
        <View zIdx={1001} absFull left={64} pl12>
            <View w100p row center mt12 h100p>
                <TabViewContainer
                    panelStyle={{ paddingTop: 2 }}
                    onChangeTabIndex={setCurrentTabIndex}
                    tabs={tabs}
                    currentTabIndex={currentTabIndex}
                />
            </View>
        </View>
    );
}
