import { FC, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { InputBlockStyled, InputFieldStyled } from './InputStyled';

export const CommentInput: FC<{ index: number }> = ({ index }) => {
    const { control } = useFormContext();
    const [focus, setFocus] = useState(false);
    const { t } = useTranslation();

    return (
        <Controller
            render={({ field, fieldState }) => (
                <InputBlockStyled valid={!fieldState.invalid} focus={focus}>
                    <InputFieldStyled
                        {...field}
                        onFocus={() => setFocus(true)}
                        onBlur={() => setFocus(false)}
                        placeholder={t('transactionDetails_comment')}
                    />
                </InputBlockStyled>
            )}
            name={`rows.${index}.comment`}
            control={control}
        />
    );
};
