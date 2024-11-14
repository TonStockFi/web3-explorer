import { TonAsset } from '@tonkeeper/core/dist/entries/crypto/asset/ton-asset';
import { TonRecipient } from '@tonkeeper/core/dist/entries/send';
import { getDecimalSeparator } from '@tonkeeper/core/dist/utils/formatting';
import { removeGroupSeparator } from '@tonkeeper/core/dist/utils/send';
import BigNumber from 'bignumber.js';
import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import { AmountInput } from './AmountInput';
import { CommentInput } from './CommentInput';
import { ReceiverInput } from './ReceiverInput';

const FormRow: FC<{
    useWalletIndex?: boolean;
    useTheSameAmount?: boolean;
    index: number;
    asset: TonAsset;
}> = ({ index, useWalletIndex, useTheSameAmount, asset }) => {
    const { control } = useFormContext();
    return (
        <>
            <Controller
                rules={{
                    required: 'Required'
                }}
                render={({ field, fieldState }) => (
                    <ReceiverInput
                        useWalletIndex={useWalletIndex}
                        field={
                            field as unknown as ControllerRenderProps<
                                {
                                    rows: {
                                        receiver: TonRecipient | null;
                                    }[];
                                },
                                `rows.${number}.receiver`
                            >
                        }
                        fieldState={fieldState}
                        index={index}
                    />
                )}
                name={`rows.${index}.receiver`}
                control={control}
            />
            <Controller
                rules={{
                    required: 'Required',
                    validate: amount => {
                        if (!amount || !amount.value) {
                            return 'Required';
                        }

                        let value;
                        try {
                            value = new BigNumber(
                                removeGroupSeparator(amount.value).replace(
                                    getDecimalSeparator(),
                                    '.'
                                )
                            );
                        } catch (e) {
                            return 'Wrong value format';
                        }

                        if (!value.isFinite() || value.eq(0)) {
                            return 'Value is 0';
                        }
                    }
                }}
                render={({ field, fieldState }) => (
                    <AmountInput
                        useTheSameAmount={useTheSameAmount}
                        index={index}
                        fieldState={fieldState}
                        field={
                            field as unknown as ControllerRenderProps<
                                {
                                    rows: {
                                        amount: { inFiat: boolean; value: string } | null;
                                    }[];
                                },
                                `rows.${number}.amount`
                            >
                        }
                        asset={asset}
                    />
                )}
                name={`rows.${index}.amount`}
                control={control}
            />
            <CommentInput index={index} />
        </>
    );
};

export default FormRow;
