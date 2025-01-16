import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';

import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import { hexToRGBA } from '../../common/utils';
import { AsideWidth, ChainsList } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import { ChainMore } from '../dropdown/ChainMore';
import { AddressWithCopy } from '../wallet/AddressWithCopy';

export const ChainListView = ({
    selectChainAccount
}: {
    selectChainAccount: { address: string; walletIndex: number; walletId?: string };
}) => {
    const account = useActiveAccount();
    const { showChainList, onShowChainList } = useIAppContext();
    const { theme } = useBrowserContext();

    return (
        <View
            drawer={{
                sx: { '& .MuiPaper-root': { top: 0 } },
                open: showChainList,
                anchor: 'right',
                onClose: () => onShowChainList(false)
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
                                <View text={'区块链帐户'}></View>
                            </View>
                            <View aCenter jEnd>
                                <View
                                    ml={6}
                                    mr12
                                    tips={'close'}
                                    iconButtonSmall
                                    icon={'Close'}
                                    onClick={() => {
                                        onShowChainList(false);
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
                        {ChainsList.map(row => {
                            return (
                                <View
                                    borderRadius={8}
                                    hoverBgColor={hexToRGBA(theme.backgroundContentTint, 0.56)}
                                    px12
                                    rowVCenter
                                    key={row.chain}
                                    jSpaceBetween
                                    py12
                                >
                                    <View rowVCenter>
                                        <View mr12>
                                            <View overflowHidden wh={24} borderRadius={12}>
                                                <ImageIcon
                                                    variant="square"
                                                    zoom={0.8}
                                                    size={24}
                                                    icon={row.icon}
                                                ></ImageIcon>
                                            </View>
                                        </View>
                                        <View text={row.name}></View>
                                    </View>
                                    <View rowVCenter>
                                        <View rowVCenter>
                                            <AddressWithCopy
                                                chain={row.chain}
                                                accountId={account.id}
                                                accountIndex={selectChainAccount.walletIndex}
                                                showAddress
                                                address={selectChainAccount.address}
                                            />
                                        </View>
                                        <View ml={6}>
                                            <ChainMore
                                                walletId={selectChainAccount.walletId!}
                                                chain={row.chain}
                                                right="-14px"
                                                top="32px"
                                                accountIndex={selectChainAccount.walletIndex}
                                                accountId={account.id}
                                            ></ChainMore>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
};
