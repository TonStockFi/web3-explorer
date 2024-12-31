import Checkbox from '@mui/material/Checkbox/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import { BLOCKCHAIN_NAME } from '@tonkeeper/core/dist/entries/crypto';
import { TonAsset } from '@tonkeeper/core/dist/entries/crypto/asset/ton-asset';
import { CloseIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { IconButton } from '@tonkeeper/uikit/dist/components/fields/IconButton';
import { AsyncValidatorsStateProvider } from '@tonkeeper/uikit/dist/hooks/useAsyncValidator';
import { useDisclosure } from '@tonkeeper/uikit/dist/hooks/useDisclosure';
import { MultiSendForm, MultiSendList } from '@tonkeeper/uikit/dist/state/multiSend';
import { useTranslation } from '@web3-explorer/lib-translation';
import Input from '@web3-explorer/uikit-mui/dist/mui/Input';
import InputAdornment from '@web3-explorer/uikit-mui/dist/mui/InputAdornment';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { FC, useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import styled, { css, useTheme } from 'styled-components';
import { AssetSelect } from './AssetSelect';
import FormRow from './FormRow';
import { MultiSendConfirmNotification } from './MultiSendConfirmNotification';
import SendSubmitButton from './SendSubmitButton';

const MultiSendTableGrid = styled.div`
    display: grid;
    grid-template-columns: 444px 1fr 206px 1fr 90px 1fr 40px;
    gap: 0.25rem;
    align-items: center;
    margin-bottom: 0.25rem;

    > *:nth-child(4n + 1) {
        grid-column: 1 / 3;
    }

    > *:nth-child(4n + 2) {
        grid-column: 3 / 5;
    }

    > *:nth-child(4n + 3) {
        grid-column: 5 / 7;
    }
`;

const TableFormWrapper = styled.form`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: auto;
`;

const Spacer = styled.div`
    flex: 1;
`;

const IconButtonStyled = styled(IconButton)<{ hide?: boolean }>`
    padding: 10px 12px;
    ${props =>
        props.hide &&
        css`
            display: none;
        `}
`;

export const MultiSendTable: FC<{
    className?: string;
    onSent?: () => void;
    asset: TonAsset;
    setAsset: (asset: TonAsset) => void;
    setOpenWalletList: (v: boolean) => void;
}> = ({ className, onSent, asset, setAsset }) => {
    const theme = useTheme();
    const [useTheSameAmount, setUseTheSameAmount] = useState(true);

    let list: MultiSendList = {
        id: 1,
        name: `List1`,
        token: asset,
        form: {
            rows: [
                {
                    receiver: null,
                    amount: null,
                    comment: ''
                },
                {
                    receiver: null,
                    amount: null,
                    comment: ''
                }
            ]
        }
    };
    const { t } = useTranslation();
    const [addMore, setAddMore] = useState(1);
    const [useWalletIndex, setUseWalletIndex] = useState(false);
    const [confirmModalForm, setConfirmModalForm] = useState<MultiSendForm | undefined>();

    const methods = useForm<MultiSendForm>({
        defaultValues: {
            rows: [...list.form.rows]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: 'rows'
    });
    const rowsValue = methods.watch('rows');
    const { isOpen, onClose, onOpen } = useDisclosure();

    const onSubmit = (submitForm: MultiSendForm) => {
        //console.log(submitForm);
        setConfirmModalForm(submitForm);
        onOpen();
    };
    useEffect(() => {
        setAddMore(rowsValue.length);
    }, [rowsValue]);
    useEffect(() => {
        const handleOnSelectAddress = (event: CustomEvent) => {
            const { addressList } = event.detail;
            const addressList1: any[] = [];
            addressList.forEach((address: string) => {
                const res = rowsValue.find(row => row.receiver && row.receiver.address === address);
                if (!res) {
                    addressList1.push({
                        receiver: {
                            bounce: false,
                            address,
                            blockchain: BLOCKCHAIN_NAME.TON
                        },
                        amount: null,
                        comment: ''
                    });
                }
            });
            if (addressList1.length > 0) append(addressList1);
            const indexList: number[] = [];
            rowsValue.forEach((row, index) => {
                //console.log(row.receiver);
                if (!row.receiver) {
                    indexList.push(index);
                }
            });
            if (indexList.length > 0) remove(indexList);
        };

        //@ts-ignore
        window.addEventListener('onSelectAddress', handleOnSelectAddress);
        return () => {
            //@ts-ignore
            window.removeEventListener('onSelectAddress', handleOnSelectAddress);
        };
    }, [rowsValue]);
    return (
        <View empty>
            <FormProvider {...methods}>
                <AsyncValidatorsStateProvider>
                    <View abs top={4} left0 right0 bottom={0}>
                        <TableFormWrapper
                            onSubmit={methods.handleSubmit(onSubmit)}
                            className={className}
                        >
                            <View
                                zIdx={1000}
                                abs
                                left0
                                right0
                                top0
                                row
                                jSpaceBetween
                                aCenter
                                h={47}
                                px={16}
                            >
                                <View row jStart aCenter userSelectNone h100p aStart>
                                    <View mr12 flx aCenter>
                                        <AssetSelect asset={asset} onAssetChange={setAsset} />
                                    </View>
                                    <View mr12 ml={6}>
                                        <Input
                                            sx={{ width: 80 }}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    {t('Row')}
                                                </InputAdornment>
                                            }
                                            value={addMore}
                                            onChange={(e: any) => {
                                                const { value } = e.target;
                                                const n = Number(value);
                                                if (value && !isNaN(n) && rowsValue.length < 256) {
                                                    setAddMore(n);
                                                }
                                            }}
                                            type="number"
                                            inputProps={{
                                                min: '1',
                                                max: '255'
                                            }}
                                        />
                                    </View>
                                    <View
                                        hide={addMore === rowsValue.length}
                                        onClick={() => {
                                            if (addMore > rowsValue.length) {
                                                const rows: any[] = [];
                                                for (
                                                    let index = 0;
                                                    index < addMore - rowsValue.length;
                                                    index++
                                                ) {
                                                    console.log({ index, addMore, rowsValue });

                                                    rows.push({
                                                        receiver: null,
                                                        amount: null,
                                                        comment: ''
                                                    });
                                                }
                                                if (rows.length > 0) {
                                                    append(rows);
                                                }
                                            } else if (addMore < rowsValue.length) {
                                                let rows: number[] = [];
                                                for (
                                                    let index = 0;
                                                    index < rowsValue.length - addMore;
                                                    index++
                                                ) {
                                                    rows.push(index);
                                                }

                                                if (rows.length > 0) {
                                                    remove(rows);
                                                }
                                            }
                                        }}
                                        buttonVariant="outlined"
                                        button={t('Reset')}
                                    />
                                </View>
                                <View jEnd aCenter>
                                    <View aCenter>
                                        <FormControlLabel
                                            sx={{
                                                '& .MuiFormControlLabel-label': {
                                                    fontSize: '0.8rem'
                                                },
                                                '& .MuiCheckbox-root': {
                                                    padding: '4px'
                                                }
                                            }}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    onChange={(e: any) => {
                                                        setUseTheSameAmount(e.target.checked);
                                                    }}
                                                    checked={useTheSameAmount}
                                                />
                                            }
                                            label={t('SameAmount')}
                                        />
                                    </View>
                                    <SendSubmitButton asset={asset} rowsValue={rowsValue} />
                                </View>
                            </View>
                            <View px={16} pt={60} pb={58}>
                                <MultiSendTableGrid>
                                    {fields.map((item, index) => (
                                        <>
                                            <FormRow
                                                useWalletIndex={useWalletIndex}
                                                useTheSameAmount={useTheSameAmount}
                                                key={item.id}
                                                index={index}
                                                asset={asset}
                                            />
                                            <IconButtonStyled
                                                type="button"
                                                transparent
                                                onClick={() => remove(index)}
                                                hide={fields.length === 1}
                                            >
                                                <CloseIcon />
                                            </IconButtonStyled>
                                        </>
                                    ))}
                                </MultiSendTableGrid>
                            </View>
                            <Spacer />
                            <View pr={24} abs bottom0 left0 right0 h={58} row jEnd aCenter>
                                <SendSubmitButton showButton asset={asset} rowsValue={rowsValue} />
                            </View>
                        </TableFormWrapper>
                    </View>
                </AsyncValidatorsStateProvider>
            </FormProvider>

            <MultiSendConfirmNotification
                isOpen={isOpen}
                form={confirmModalForm}
                asset={asset}
                onClose={() => {
                    onClose();
                    onSent && onSent();
                }}
                listName={'List'}
            />
        </View>
    );
};
