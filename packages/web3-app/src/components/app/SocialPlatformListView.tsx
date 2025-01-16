import Mnemonic from '@web3-explorer/lib-crypto/dist/Mnemonic';
import Wallet from '@web3-explorer/lib-crypto/dist/Wallet';
import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';

import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { useEffect } from 'react';
import { hexToRGBA } from '../../common/utils';
import { AsideWidth, TELEGRAME_WEB } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

export const SocialPlatformListView = ({
    selectChainAccount
}: {
    selectChainAccount: { address: string; walletIndex: number };
}) => {
    const account = useActiveAccount();
    const {
        currentChainCode,
        showChainList,
        onChangeCurrentChainCode,
        onShowChainList,
        showSocialPlatformList,
        onShowSocialPlatformList
    } = useIAppContext();
    const { theme } = useBrowserContext();
    const { openTabFromWebview } = useBrowserContext();
    useEffect(() => {
        const mnem = new Mnemonic();
        const wallet = new Wallet(mnem);
        const waletAccount = wallet.getEthWallet(selectChainAccount.walletIndex, true);
        const address1 = waletAccount.address;
        console.log({ wallet, mnem, address1 }, waletAccount, selectChainAccount.walletIndex);
    }, []);

    return (
        <View
            drawer={{
                sx: { '& .MuiPaper-root': { top: 0 } },
                open: showSocialPlatformList,
                anchor: 'right',
                onClose: () => onShowSocialPlatformList(false)
            }}
        >
            <View
                sx={{ color: theme.textPrimary }}
                column
                h100vh
                w={AsideWidth}
                bgColor={`${theme.backgroundContent}`}
                relative
            >
                <View absFull>
                    <View
                        flx
                        aCenter
                        column
                        abs
                        top0
                        xx0
                        h={44}
                        rowVCenter
                        borderBox
                        sx={{
                            borderBottom: `1px solid ${theme.separatorCommon}`
                        }}
                    >
                        <View mt={3} mb={2} borderBox pl12 rowVCenter jSpaceBetween aCenter w100p>
                            <View aCenter flex1>
                                <View text={'社交平台'}></View>
                            </View>
                            <View aCenter jEnd>
                                <View
                                    ml={6}
                                    mr12
                                    tips={'close'}
                                    iconButtonSmall
                                    icon={'Close'}
                                    onClick={() => {
                                        onShowSocialPlatformList(false);
                                    }}
                                ></View>
                            </View>
                        </View>
                    </View>
                    <View
                        px={8}
                        borderBox
                        py={12}
                        column
                        absFull
                        top={44}
                        bottom={44}
                        overflowYAuto
                    >
                        <View
                            borderRadius={8}
                            hoverBgColor={hexToRGBA(theme.backgroundContentTint, 0.56)}
                            px12
                            rowVCenter
                            jSpaceBetween
                            py12
                        >
                            <View rowVCenter>
                                <View mr12>
                                    <View overflowHidden wh={24} borderRadius={0}>
                                        <ImageIcon
                                            variant="rounded"
                                            zoom={0.8}
                                            size={24}
                                            icon={'icon_telegram'}
                                        ></ImageIcon>
                                    </View>
                                </View>
                                <View text={'Telegram'}></View>
                            </View>
                            <View rowVCenter h={28}>
                                <View
                                    buttonContained="打开"
                                    onClick={() => {
                                        openTabFromWebview({
                                            url: TELEGRAME_WEB,
                                            name: 'Telegram',
                                            icon: 'icon_telegram',
                                            description: ''
                                        });
                                    }}
                                ></View>
                            </View>
                        </View>

                        <View
                            borderRadius={8}
                            hoverBgColor={hexToRGBA(theme.backgroundContentTint, 0.56)}
                            px12
                            rowVCenter
                            jSpaceBetween
                            py12
                        >
                            <View rowVCenter>
                                <View mr12>
                                    <View overflowHidden wh={24} borderRadius={0}>
                                        <ImageIcon
                                            variant="rounded"
                                            zoom={0.8}
                                            size={24}
                                            icon={'icon_twitter'}
                                        ></ImageIcon>
                                    </View>
                                </View>
                                <View text={'X'}></View>
                            </View>
                            <View rowVCenter h={28}>
                                <View
                                    buttonContained="打开"
                                    onClick={() => {
                                        openTabFromWebview({
                                            url: 'https://x.com',
                                            name: 'X',
                                            icon: 'icon_twitter',
                                            description: ''
                                        });
                                    }}
                                ></View>
                            </View>
                        </View>
                        <View
                            borderRadius={8}
                            hoverBgColor={hexToRGBA(theme.backgroundContentTint, 0.56)}
                            px12
                            rowVCenter
                            jSpaceBetween
                            py12
                        >
                            <View rowVCenter>
                                <View mr12>
                                    <View overflowHidden wh={24} borderRadius={0}>
                                        <ImageIcon
                                            variant="rounded"
                                            zoom={0.8}
                                            size={24}
                                            icon={'icon_discord'}
                                        ></ImageIcon>
                                    </View>
                                </View>
                                <View text={'Discord'}></View>
                            </View>
                            <View rowVCenter h={28}>
                                <View
                                    buttonContained="打开"
                                    onClick={() => {
                                        openTabFromWebview({
                                            url: 'https://discord.com/app',
                                            name: 'Discord',
                                            icon: 'icon_discord',
                                            description: ''
                                        });
                                    }}
                                ></View>
                            </View>
                        </View>
                        <View
                            borderRadius={8}
                            hoverBgColor={hexToRGBA(theme.backgroundContentTint, 0.56)}
                            px12
                            rowVCenter
                            jSpaceBetween
                            py12
                        >
                            <View rowVCenter>
                                <View mr12>
                                    <View overflowHidden wh={24} borderRadius={0}>
                                        <ImageIcon
                                            variant="rounded"
                                            zoom={0.8}
                                            size={24}
                                            icon={'icon_gmail'}
                                        ></ImageIcon>
                                    </View>
                                </View>
                                <View text={'Gmail'}></View>
                            </View>
                            <View rowVCenter h={28}>
                                <View
                                    buttonContained="打开"
                                    onClick={() => {
                                        openTabFromWebview({
                                            url: 'https://gmail.com',
                                            name: 'Gmail',
                                            icon: 'icon_gmail',
                                            description: ''
                                        });
                                    }}
                                ></View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};
