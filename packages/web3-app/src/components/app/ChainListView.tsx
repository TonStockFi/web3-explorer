import { View } from '@web3-explorer/uikit-view';
import { ImageIcon } from '@web3-explorer/uikit-view/dist/icons/ImageIcon';
import { hexToRGBA } from '../../common/utils';
import { AsideWidth, ChainsList } from '../../constant';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { useIAppContext } from '../../providers/IAppProvider';

export const ChainListView = () => {
    const { currentChainCode, showChainList, onShowChainList } = useIAppContext();
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
                                <View text={'选择区块链'}></View>
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
                            const isActived = row.chain === currentChainCode;
                            return (
                                <View
                                    pointer
                                    borderRadius={8}
                                    hoverBgColor={hexToRGBA(theme.backgroundContent, 0.3)}
                                    px12
                                    rowVCenter
                                    key={row.chain}
                                    jSpaceBetween
                                    py12
                                >
                                    <View rowVCenter>
                                        <View mr12>
                                            <View overflowHidden wh={24} borderRadius={12}>
                                                <ImageIcon size={24} icon={row.icon}></ImageIcon>
                                            </View>
                                        </View>
                                        <View text={row.name}></View>
                                    </View>
                                    <View rowVCenter>
                                        <View
                                            textColor={theme.textSecondary}
                                            hide={isActived}
                                            text={'开发中'}
                                            mr12
                                            textFontSize="0.8rem"
                                        ></View>
                                        <View wh={22} center>
                                            <View
                                                icon={!isActived ? 'ToggleOff' : 'ToggleOn'}
                                                iconProps={{
                                                    sx: {
                                                        color: isActived
                                                            ? `${theme.accentGreen}!important`
                                                            : undefined
                                                    }
                                                }}
                                            />
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
