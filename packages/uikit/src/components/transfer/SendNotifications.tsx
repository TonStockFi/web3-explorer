import { TransferInitParams } from '@tonkeeper/core/dist/AppSdk';
import { BLOCKCHAIN_NAME } from '@tonkeeper/core/dist/entries/crypto';
import { AssetAmount } from '@tonkeeper/core/dist/entries/crypto/asset/asset-amount';
import { toTronAsset } from '@tonkeeper/core/dist/entries/crypto/asset/constants';
import { jettonToTonAsset, TonAsset } from '@tonkeeper/core/dist/entries/crypto/asset/ton-asset';
import { RecipientData, TonRecipientData } from '@tonkeeper/core/dist/entries/send';
import {
    parseTonTransfer,
    TonTransferParams
} from '@tonkeeper/core/dist/service/deeplinkingService';
import { shiftedDecimals } from '@tonkeeper/core/dist/utils/balance';
import BigNumber from 'bignumber.js';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useAppContext } from '../../hooks/appContext';
import { useAppSdk } from '../../hooks/appSdk';
import { openIosKeyboard } from '../../hooks/ios';
import { useTranslation } from '../../hooks/translation';
import { useIsFullWidthMode } from '../../hooks/useIsFullWidthMode';
import { MultisigOrderLifetimeMinutes } from '../../libs/multisig';
import { useJettonList } from '../../state/jetton';
import { useIsActiveAccountMultisig } from '../../state/multisig';
import { useTronBalances } from '../../state/tron/tron';
import {
    Notification,
    NotificationFooter,
    NotificationFooterPortal,
    NotificationHeader,
    NotificationHeaderPortal
} from '../Notification';
import { ConfirmMultisigNewTransferView } from './ConfirmMultisigNewTransferView';
import { ConfirmTransferView } from './ConfirmTransferView';
import {
    ConfirmViewButtons,
    ConfirmViewButtonsSlot,
    ConfirmViewTitle,
    ConfirmViewTitleSlot
} from './ConfirmView';
import { MultisigOrderFormView } from './MultisigOrderFormView';
import { RecipientView, useGetToAccount } from './RecipientView';
import { AmountView } from './amountView/AmountView';
import { AmountState } from './amountView/amountState';
import {
    AmountHeaderBlock,
    AmountMainButton,
    childFactoryCreator,
    ConfirmMainButton,
    duration,
    getInitData,
    getJetton,
    InitTransferData,
    MainButton,
    RecipientHeaderBlock,
    TransferViewHeaderBlock,
    Wrapper
} from './common';

const SendContent: FC<{
    onClose: () => void;
    chain?: BLOCKCHAIN_NAME;
    initRecipient?: RecipientData;
    initAmountState?: Partial<AmountState>;
}> = ({ onClose, chain, initRecipient, initAmountState }) => {
    const sdk = useAppSdk();
    const { standalone, ios, extension } = useAppContext();
    const { t } = useTranslation();
    const { data: filter } = useJettonList();
    const isFullWidth = useIsFullWidthMode();
    const isActiveAccountMultisig = useIsActiveAccountMultisig();
    const initView = initRecipient ? 'amount' : 'recipient';
    const [view, _setView] = useState<'multisig-settings' | 'recipient' | 'amount' | 'confirm'>(
        isActiveAccountMultisig ? 'multisig-settings' : initView
    );
    const setView = useCallback(
        (val: typeof view) => {
            if (!isActiveAccountMultisig && val === 'multisig-settings') {
                val = 'recipient';
            }

            _setView(val);
        },
        [_setView, isActiveAccountMultisig]
    );

    const [right, setRight] = useState(true);
    const [multisigTimeout, setMultisigTimeout] = useState<
        MultisigOrderLifetimeMinutes | undefined
    >();
    const [recipient, _setRecipient] = useState<RecipientData | undefined>(initRecipient);
    const [amountViewState, setAmountViewState] = useState<Partial<AmountState> | undefined>(
        initAmountState
    );
    const { data: tronBalances } = useTronBalances();

    const { mutateAsync: getAccountAsync, isLoading: isAccountLoading } = useGetToAccount();

    const setRecipient = (value: RecipientData) => {
        if (
            amountViewState?.token?.blockchain &&
            amountViewState?.token?.blockchain !== value.address.blockchain
        ) {
            setAmountViewState(undefined);
        }

        _setRecipient(value);
        if (tronBalances && value.address.blockchain === BLOCKCHAIN_NAME.TRON) {
            setAmountViewState({ token: toTronAsset(tronBalances.balances[0]) });
        }
    };

    const onRecipient = (data: RecipientData) => {
        setRight(true);
        setRecipient(data);
        setView('amount');
    };

    const onConfirmAmount = (data: AmountState) => {
        setRight(true);
        setAmountViewState(data);
        setView('confirm');
    };

    const backToRecipient = (data?: AmountState) => {
        setRight(false);
        setAmountViewState(data);
        setView('recipient');
    };

    const backToAmount = () => {
        if (ios) openIosKeyboard('decimal');
        setRight(false);
        setView('amount');
    };

    const processTron = (address: string) => {
        const item = { address: address, blockchain: BLOCKCHAIN_NAME.TRON } as const;

        setRecipient({
            address: item,
            done: true
        });
        setView('amount');
    };

    const processRecipient = async ({ address, text }: TonTransferParams) => {
        const item = { address: address, blockchain: BLOCKCHAIN_NAME.TON } as const;
        const toAccount = await getAccountAsync(item);

        const done = !toAccount.memoRequired ? true : toAccount.memoRequired && text ? true : false;

        setRecipient({
            address: item,
            toAccount,
            comment: text ?? '',
            done
        });
        if (done) {
            setView('amount');
        }
    };

    const processJetton = useCallback(
        async ({ amount: a, jetton }: TonTransferParams) => {
            if (jetton && filter) {
                let actualAsset;
                try {
                    actualAsset = jettonToTonAsset(jetton, filter);
                } catch (e) {
                    sdk.uiEvents.emit('copy', {
                        method: 'copy',
                        params: t('Unexpected_QR_Code')
                    });
                    return false;
                }

                const assetAmount = new AssetAmount({
                    asset: actualAsset,
                    weiAmount: a || '0'
                });

                setAmountViewState({
                    coinValue: assetAmount.relativeAmount,
                    token: actualAsset,
                    inFiat: false,
                    isMax: false
                });
            } else {
                setAmountViewState({
                    coinValue: a ? shiftedDecimals(a) : new BigNumber('0'),
                    token: initAmountState?.token,
                    inFiat: false,
                    isMax: false
                });
            }

            return true;
        },
        [sdk, filter, initAmountState?.token]
    );

    const onScan = async (signature: string) => {
        const param = parseTonTransfer({ url: signature });

        if (param) {
            const ok = await processJetton(param);
            if (ok) {
                await processRecipient(param);
            }
            return;
        }

        // TODO: ENABLE TRON
        // if (seeIfValidTronAddress(signature)) {
        //     return processTron(signature);
        // }

        return sdk.uiEvents.emit('copy', {
            method: 'copy',
            params: t('Unexpected_QR_Code')
        });
    };

    const multisigSettingsRef = useRef<HTMLDivElement>(null);
    const recipientRef = useRef<HTMLDivElement>(null);
    const amountRef = useRef<HTMLDivElement>(null);
    const confirmRef = useRef<HTMLDivElement>(null);

    const nodeRef = {
        'multisig-settings': multisigSettingsRef,
        recipient: recipientRef,
        amount: amountRef,
        confirm: confirmRef
    }[view];
    console.log({ recipient, amountViewState, initAmountState });

    return (
        <Wrapper standalone={standalone} extension={extension}>
            <TransitionGroup childFactory={childFactoryCreator(right)}>
                <CSSTransition
                    key={view}
                    nodeRef={nodeRef}
                    classNames="right-to-left"
                    addEndListener={done => {
                        setTimeout(done, duration);
                    }}
                >
                    {status => (
                        <div ref={nodeRef}>
                            {view === 'multisig-settings' && (
                                <MultisigOrderFormView
                                    onSubmit={val => {
                                        setRight(true);
                                        setMultisigTimeout(val.lifetime);
                                        setView('recipient');
                                    }}
                                    isAnimationProcess={status === 'exiting'}
                                    Header={() => (
                                        <TransferViewHeaderBlock
                                            title={t('multisig_create_order_title')}
                                            onClose={onClose}
                                        />
                                    )}
                                    MainButton={MainButton}
                                />
                            )}
                            {view === 'recipient' && (
                                <RecipientView
                                    data={recipient}
                                    setRecipient={onRecipient}
                                    onScan={onScan}
                                    keyboard="decimal"
                                    isExternalLoading={isAccountLoading}
                                    acceptBlockchains={chain ? [chain] : undefined}
                                    MainButton={MainButton}
                                    HeaderBlock={() => (
                                        <RecipientHeaderBlock
                                            onBack={
                                                isActiveAccountMultisig
                                                    ? () => {
                                                          setRight(false);
                                                          setView('multisig-settings');
                                                      }
                                                    : undefined
                                            }
                                            title={t('transaction_recipient')}
                                            onClose={onClose}
                                        />
                                    )}
                                    isAnimationProcess={status === 'exiting'}
                                />
                            )}
                            {view === 'amount' && (
                                <AmountView
                                    defaults={amountViewState}
                                    onClose={onClose}
                                    onBack={backToRecipient}
                                    recipient={recipient!}
                                    onConfirm={onConfirmAmount}
                                    MainButton={AmountMainButton}
                                    HeaderBlock={AmountHeaderBlock}
                                    isAnimationProcess={status === 'exiting'}
                                />
                            )}
                            {view === 'confirm' &&
                                (isActiveAccountMultisig ? (
                                    <ConfirmMultisigNewTransferView
                                        onClose={onClose}
                                        onBack={backToAmount}
                                        recipient={recipient as TonRecipientData}
                                        assetAmount={
                                            AssetAmount.fromRelativeAmount({
                                                asset: amountViewState!.token!,
                                                amount: amountViewState!.coinValue!
                                            }) as AssetAmount<TonAsset>
                                        }
                                        isMax={amountViewState!.isMax!}
                                        ttl={multisigTimeout!}
                                    >
                                        {status !== 'exiting' && isFullWidth && (
                                            <ConfirmViewTitleSlot>
                                                <NotificationHeaderPortal>
                                                    <NotificationHeader>
                                                        <ConfirmViewTitle />
                                                    </NotificationHeader>
                                                </NotificationHeaderPortal>
                                            </ConfirmViewTitleSlot>
                                        )}
                                        {status !== 'exiting' && isFullWidth && (
                                            <ConfirmViewButtonsSlot>
                                                <NotificationFooterPortal>
                                                    <NotificationFooter>
                                                        <ConfirmViewButtons
                                                            MainButton={ConfirmMainButton}
                                                        />
                                                    </NotificationFooter>
                                                </NotificationFooterPortal>
                                            </ConfirmViewButtonsSlot>
                                        )}
                                    </ConfirmMultisigNewTransferView>
                                ) : (
                                    <ConfirmTransferView
                                        onClose={onClose}
                                        onBack={backToAmount}
                                        recipient={recipient!}
                                        assetAmount={AssetAmount.fromRelativeAmount({
                                            asset: amountViewState!.token!,
                                            amount: amountViewState!.coinValue!
                                        })}
                                        isMax={amountViewState!.isMax!}
                                    >
                                        {status !== 'exiting' && isFullWidth && (
                                            <ConfirmViewTitleSlot>
                                                <NotificationHeaderPortal>
                                                    <NotificationHeader>
                                                        <ConfirmViewTitle />
                                                    </NotificationHeader>
                                                </NotificationHeaderPortal>
                                            </ConfirmViewTitleSlot>
                                        )}
                                        {status !== 'exiting' && isFullWidth && (
                                            <ConfirmViewButtonsSlot>
                                                <NotificationFooterPortal>
                                                    <NotificationFooter>
                                                        <ConfirmViewButtons
                                                            MainButton={ConfirmMainButton}
                                                        />
                                                    </NotificationFooter>
                                                </NotificationFooterPortal>
                                            </ConfirmViewButtonsSlot>
                                        )}
                                    </ConfirmTransferView>
                                ))}
                        </div>
                    )}
                </CSSTransition>
            </TransitionGroup>
        </Wrapper>
    );
};

const SendActionNotification = () => {
    const [open, setOpen] = useState(false);
    const [chain, setChain] = useState<BLOCKCHAIN_NAME | undefined>(undefined);
    const [tonTransfer, setTonTransfer] = useState<InitTransferData | undefined>(undefined);
    const { data: jettons } = useJettonList();

    const { mutateAsync: getAccountAsync, reset } = useGetToAccount();
    const sdk = useAppSdk();

    useEffect(() => {
        const handler = (options: {
            method: 'transfer';
            id?: number | undefined;
            params: TransferInitParams;
        }) => {
            reset();

            const { transfer, asset } = options.params;
            setChain(options.params.chain);
            if (transfer) {
                getAccountAsync({ address: transfer.address }).then(account => {
                    const { initRecipient, initAmountState } = getInitData(
                        transfer,
                        account,
                        jettons
                    );
                    const { amount } = transfer;
                    if (initAmountState && !initAmountState.inputValue && amount) {
                        initAmountState.inputValue = amount;
                    }
                    setTonTransfer({ initRecipient, initAmountState });
                    setOpen(true);
                });
            } else {
                setTonTransfer(getJetton(asset, jettons));
                setOpen(true);
            }
        };

        sdk.uiEvents.on('transfer', handler);
        return () => {
            sdk.uiEvents.off('transfer', handler);
        };
    }, [jettons]);

    const onClose = useCallback(() => {
        setTonTransfer(undefined);
        setOpen(false);
    }, []);

    const Content = useCallback(() => {
        if (!open) return undefined;
        return (
            <SendContent
                onClose={onClose}
                chain={chain}
                initAmountState={tonTransfer?.initAmountState}
                initRecipient={tonTransfer?.initRecipient}
            />
        );
    }, [open, tonTransfer, chain]);

    return (
        <Notification isOpen={open} handleClose={onClose} hideButton backShadow footer={<></>}>
            {Content}
        </Notification>
    );
};

export default SendActionNotification;
