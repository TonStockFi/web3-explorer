import { AccountMAM } from '@tonkeeper/core/dist/entries/account';
import { TonRecipient } from '@tonkeeper/core/dist/entries/send';
import { formatAddress, toShortValue } from '@tonkeeper/core/dist/utils/common';
import { SpinnerRing, XMarkCircleIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import { IconButton } from '@tonkeeper/uikit/dist/components/fields/IconButton';
import { useAsyncValidator } from '@tonkeeper/uikit/dist/hooks/useAsyncValidator';
import { useCopyToClipboard } from '@tonkeeper/uikit/dist/hooks/useCopyToClipboard';
import {
    MultiSendForm,
    getPastedTable,
    useMultiSendReceiverValidator
} from '@tonkeeper/uikit/dist/state/multiSend';
import { useActiveAccount } from '@tonkeeper/uikit/dist/state/wallet';
import InputBlock from '@web3-explorer/uikit-mui/dist/mui/Input';
import { View } from '@web3-explorer/uikit-view';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ControllerFieldState, ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useIAppContext } from '../../providers/IAppProvider';
import { InputBlockStyled, InputFieldStyled } from './InputStyled';

const SpinnerRingStyled = styled(SpinnerRing)`
    transform: scale(1.2);
`;

const Body2Secondary = styled(Body2)`
    white-space: nowrap;
    color: ${p => p.theme.textSecondary};
`;

const AddressText = styled(Body2Secondary)`
    white-space: nowrap;
    cursor: pointer;
`;

const ReceiverInputFieldStyled = styled(InputFieldStyled)`
    min-width: 100px;
`;

export const ReceiverInput: FC<{
    useWalletIndex?: boolean;
    field: ControllerRenderProps<
        {
            rows: {
                receiver: TonRecipient | null;
            }[];
        },
        `rows.${number}.receiver`
    >;
    fieldState: ControllerFieldState;
    index: number;
}> = ({ field, useWalletIndex, fieldState, index }) => {
    const { t } = useTranslation();
    const { showSnackbar } = useIAppContext();
    const methods = useFormContext();
    const [focus, setFocus] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [currentWalletIndex, setCurrentWalletIndex] = useState('');

    const inputTouched = useRef(false);
    const account = useActiveAccount() as AccountMAM;

    const validator = useMultiSendReceiverValidator();

    const [validationState, validationProduct] = useAsyncValidator<string, string, TonRecipient>(
        methods,
        inputValue,
        field.name,
        validator
    );
    const isValidating = validationState === 'validating';
    useEffect(() => {
        if (!inputTouched.current) {
            return;
        }
        field.onChange(validationProduct);
    }, [field.onChange, validationProduct]);

    useEffect(() => {
        if (!field.value) {
            return;
        }

        setInputValue(
            'dns' in field.value && field.value.dns.account.name
                ? field.value.dns.account.name
                : field.value.address
        );
    }, []);

    const { onCopy, copied } = useCopyToClipboard(validationProduct?.address ?? '');

    const validate = useMultiSendReceiverValidator();
    const onPaste = useCallback(
        async (e: React.ClipboardEvent<HTMLInputElement>) => {
            const clipText = e.clipboardData.getData('Text');
            const values = await getPastedTable(clipText, validate);
            console.log('paste');
            if (values == null) return;
            const form = methods.getValues() as MultiSendForm;
            form.rows.splice(index, values.length, ...values);
            methods.reset(form);
        },
        [methods, validate]
    );

    return (
        <View row>
            {/* <View w={64} h={54} text={`# ${index + 1}`} mr={4} flx aCenter /> */}
            {useWalletIndex && (
                <InputBlock
                    placeholder={t('WalletIndex')}
                    onChange={async (e: any) => {
                        const { value } = e.target;
                        setCurrentWalletIndex(value);
                        if (value) {
                            let idx = Number(value);
                            const { addedDerivationsIndexes, activeDerivationIndex } = account;
                            if (activeDerivationIndex === idx - 1) {
                                showSnackbar({
                                    message: 'index must not be self'
                                });
                                return;
                            }
                            if (addedDerivationsIndexes.indexOf(idx - 1) === -1) {
                                showSnackbar({
                                    message: 'Wallet index not open'
                                });
                                return;
                            }
                            const wallet = account.derivations[idx - 1].tonWallets[0];
                            const address = formatAddress(wallet.rawAddress);
                            const form = methods.getValues() as MultiSendForm;
                            if (
                                form.rows.find(
                                    row => row.receiver && row.receiver.address === address
                                )
                            ) {
                                showSnackbar({ message: 'address exits' });
                                return;
                            }
                            const res = await validate(address);
                            if (res && typeof res === 'object' && 'success' in res && res.success) {
                                setInputValue(address);
                                field.onChange(res.result);
                            }
                        }
                    }}
                    value={currentWalletIndex}
                    inputProps={{
                        min: '1',
                        max: '255'
                    }}
                    type={'number'}
                    sx={{ width: 80, mr: 1 }}
                ></InputBlock>
            )}

            <InputBlockStyled valid={!fieldState.invalid} focus={false}>
                <ReceiverInputFieldStyled
                    {...field}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    onChange={(e: any) => {
                        inputTouched.current = true;
                        setInputValue(e.target.value);
                    }}
                    value={inputValue}
                    placeholder={t('transactionDetails_recipient')}
                    onPaste={onPaste}
                />
                {isValidating && <SpinnerRingStyled />}
                {!isValidating &&
                    validationProduct &&
                    'dns' in validationProduct &&
                    (copied ? (
                        <Body2Secondary>{t('address_copied')}</Body2Secondary>
                    ) : (
                        <AddressText onClick={onCopy}>
                            {toShortValue(formatAddress(validationProduct.address))}
                        </AddressText>
                    ))}
                {!isValidating && inputValue && (
                    <IconButton
                        onClick={() => {
                            inputTouched.current = true;
                            setInputValue('');
                        }}
                    >
                        <XMarkCircleIcon />
                    </IconButton>
                )}
            </InputBlockStyled>
        </View>
    );
};
