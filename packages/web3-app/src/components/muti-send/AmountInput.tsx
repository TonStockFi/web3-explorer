import { TonAsset } from '@tonkeeper/core/dist/entries/crypto/asset/ton-asset';
import { getDecimalSeparator } from '@tonkeeper/core/dist/utils/formatting';
import { formatSendValue, isNumeric, removeGroupSeparator } from '@tonkeeper/core/dist/utils/send';
import { Body2 } from '@tonkeeper/uikit/dist/components/Text';
import {
    replaceTypedDecimalSeparator,
    seeIfValueValid
} from '@tonkeeper/uikit/dist/components/transfer/amountView/AmountViewUI';
import { useAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { formatter } from '@tonkeeper/uikit/dist/hooks/balance';
import { useRate } from '@tonkeeper/uikit/dist/state/rates';
import BigNumber from 'bignumber.js';
import { FC, useEffect, useId, useRef, useState } from 'react';
import { ControllerFieldState, ControllerRenderProps } from 'react-hook-form/dist/types/controller';
import styled, { css } from 'styled-components';
import { InputBlockStyled, InputFieldStyled } from './InputStyled';

const InputBlockStyled1:any = styled(InputBlockStyled)<{ disabled?: boolean }>`
    background-color: ${p => (p.disabled ? '#322704' : undefined)};
`;

const AmountInputFieldStyled:any = styled(InputFieldStyled)<{ color?: string }>`
    text-align: right;
    min-width: 1px;
    flex: 1;

    transition: color 0.1s ease-in-out;

    &:disabled {
        cursor: not-allowed;
    }

    ${p =>
        p.color &&
        css`
            color: ${p.theme[p.color]};
        `};
`;

const AmountInputFieldRight = styled(Body2)<{ color?: string; isDisabled?: boolean }>`
    height: fit-content;
    align-self: center;

    transition: color 0.1s ease-in-out;

    ${p =>
        p.isDisabled &&
        css`
            cursor: not-allowed;
        `}

    ${p =>
        p.color &&
        css`
            color: ${p.theme[p.color]};
        `};
`;

export const AmountInput: FC<{
    field: ControllerRenderProps<
        {
            rows: {
                amount: { inFiat: boolean; value: string } | null;
            }[];
        },
        `rows.${number}.amount`
    >;
    index: number;
    asset: TonAsset;
    useTheSameAmount?: boolean;
    fieldState: ControllerFieldState;
}> = ({ index, useTheSameAmount, asset, fieldState, field }) => {
    const { fiat } = useAppContext();
    const [focus, setFocus] = useState(false);
    const [currencyAmount, setCurrencyAmount] = useState({
        inFiat: false,
        tokenValue: '',
        fiatValue: '',
        inputValue: ''
    });

    const { data, isFetched } = useRate(
        typeof asset.address === 'string' ? asset.address : asset.address.toRawString()
    );

    const price = data?.prices || 0;
    const isFiatInputDisabled = !price;
    useEffect(() => {
        if (index > 0 && useTheSameAmount) {
            const handleAmountChange = (event: CustomEvent) => {
                const { amount } = event.detail;
                const { inFiat, value } = amount;
                console.log('handleAmountChange', { index, amount, price });
                onInput(inFiat, value);
            };

            //@ts-ignore
            window.addEventListener('amountChanged', handleAmountChange);
            return () => {
                //@ts-ignore
                window.removeEventListener('amountChanged', handleAmountChange);
            };
        }
    }, [index, useTheSameAmount, price]);
    const onInput = (inFiat: boolean, newValue: string) => {
        const decimals = currencyAmount.inFiat ? 2 : asset.decimals;

        let inputValue = replaceTypedDecimalSeparator(newValue);
        const onChange = (amount: { inFiat: boolean; value: string }) => {
            field.onChange(amount);
            if (index === 0 && useTheSameAmount) {
                window.dispatchEvent(
                    new CustomEvent('amountChanged', {
                        detail: { amount }
                    })
                );
            }
        };
        if (!inputValue) {
            setCurrencyAmount(s => ({
                ...s,
                inputValue,
                tokenValue: '',
                fiatValue: ''
            }));
            if (index === 0) {
                onChange({
                    inFiat,
                    value: ''
                });
            }
            return;
        }

        if (!seeIfValueValid(inputValue, decimals)) {
            onChange({
                inFiat,
                value: ''
            });
            return;
        }

        let tokenValue = currencyAmount.tokenValue;
        let fiatValue = currencyAmount.fiatValue;

        if (isNumeric(inputValue) && !inputValue.endsWith(getDecimalSeparator())) {
            const formattedInput = formatSendValue(inputValue);
            const bnInput = new BigNumber(
                removeGroupSeparator(inputValue).replace(getDecimalSeparator(), '.')
            );
            if (inFiat) {
                tokenValue = formatter.format(!price ? new BigNumber(0) : bnInput.div(price), {
                    decimals: asset.decimals
                });

                fiatValue = formattedInput;
            } else {
                fiatValue = formatter.format(bnInput.multipliedBy(price), { decimals: 2 });

                tokenValue = formattedInput;
            }

            inputValue = formatSendValue(inputValue);
        }

        onChange({
            inFiat,
            value: inFiat ? fiatValue : tokenValue
        });

        setCurrencyAmount({
            inFiat,
            inputValue,
            tokenValue,
            fiatValue
        });
    };

    useEffect(() => {
        if (!field.value || !isFetched) {
            return;
        }

        if (!price && field.value.inFiat) {
            setCurrencyAmount({ inFiat: false, tokenValue: '', fiatValue: '', inputValue: '' });
            field.onChange(null);
        } else {
            onInput(field.value.inFiat, field.value.value);
        }
    }, [price, isFetched]);

    const tokenId = useId();
    const fiatId = useId();
    const tokenRef = useRef<HTMLInputElement | null>(null);
    const fiatRef = useRef<HTMLInputElement | null>(null);

    const onFocus = (inFiat: boolean) => {
        setFocus(true);
        if (inFiat !== currencyAmount.inFiat) {
            setCurrencyAmount(s => ({
                ...s,
                inFiat,
                inputValue: inFiat ? s.fiatValue : s.tokenValue
            }));

            field.onChange({
                inFiat,
                value: inFiat ? currencyAmount.fiatValue : currencyAmount.tokenValue
            });
        }
    };

    const onBlur = () => {
        const activeId = document.activeElement?.id;
        if (activeId !== tokenId && activeId !== fiatId) {
            setFocus(false);
            field.onBlur();
        }
    };
    const disabled = Boolean(useTheSameAmount && index > 0)
    return (
        <InputBlockStyled1 disabled={disabled} valid={!fieldState.invalid} focus={ disabled ? false : focus}>
            <AmountInputFieldStyled
                id={tokenId}
                readOnly={disabled}
                disabled={disabled}
                onFocus={() => onFocus(false)}
                onBlur={onBlur}
                placeholder="0"
                onChange={(e:any) => onInput(false, e.target.value)}
                value={
                    currencyAmount.inFiat ? currencyAmount.tokenValue : currencyAmount.inputValue
                }
                color={currencyAmount.inFiat ? 'textTertiary' : 'textPrimary'}
                type="text"
                ref={tokenRef}
            />
            <AmountInputFieldRight
                color={
                    currencyAmount.inFiat || (!currencyAmount.inputValue && !focus)
                        ? 'textTertiary'
                        : 'textPrimary'
                }
                onClick={() => {
                    tokenRef.current?.focus();
                    onFocus(false);
                }}
            >
                {asset.symbol}
            </AmountInputFieldRight>
            <AmountInputFieldStyled
                id={fiatId}
                onFocus={() => onFocus(true)}
                onBlur={onBlur}
                placeholder="0"
                onChange={(e:any) => onInput(true, e.target.value)}
                value={currencyAmount.inFiat ? currencyAmount.inputValue : currencyAmount.fiatValue}
                color={currencyAmount.inFiat ? 'textPrimary' : 'textTertiary'}
                type="text"
                autoComplete="off"
                readOnly={disabled}
                disabled={disabled || isFiatInputDisabled}
                ref={fiatRef}
            />
            <AmountInputFieldRight
                color={currencyAmount.inFiat ? 'textPrimary' : 'textTertiary'}
                isDisabled={isFiatInputDisabled}
                onClick={() => {
                    if (isFiatInputDisabled) {
                        return;
                    }
                    fiatRef.current?.focus();
                    onFocus(true);
                }}
            >
                {fiat}
            </AmountInputFieldRight>
        </InputBlockStyled1>
    );
};
