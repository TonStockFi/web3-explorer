import { CenterContainer } from '@tonkeeper/uikit/dist/components/Layout';
import { Body2, H2 } from '@tonkeeper/uikit/dist/components/Text';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { Input } from '@tonkeeper/uikit/dist/components/fields/Input';
import { View } from '@web3-explorer/uikit-view';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { useIAppContext } from '../../providers/IAppProvider';

const Block = styled.form`
    display: flex;
    text-align: center;
    gap: 1rem;
    flex-direction: column;
`;

const Body = styled(Body2)`
    text-align: center;
    color: ${props => props.theme.textSecondary};
`;

export const WalletBatchCreateNumber: FC<{
    onClose?: () => void;
    onImport?: () => void;
    submitHandler: ({ count }: { count: number }) => void | Promise<void>;
}> = ({ submitHandler, onImport, onClose }) => {
    const { t } = useTranslation();

    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.focus();
        }
    }, [ref.current]);

    const [count, setCount] = useState('2');
    const [loading, setLoading] = useState(false);

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
        e.preventDefault();
        setLoading(true);
        await submitHandler({ count: Number(count) });
        setLoading(false);
    };

    const onChange = (value: string) => {
        setCount(value);
    };
    const maxCount = 1000;
    const isValid = Number(count) >= 1 || Number(count) <= maxCount;
    const theme = useTheme();
    const { env } = useIAppContext();

    return (
        <CenterContainer>
            <View
                hide={!onClose}
                wh={32}
                zIdx={1}
                abs
                left={env.isMac ? undefined : 24}
                right={env.isMac ? 24 : undefined}
                top0
                mt12
            >
                <View
                    onClick={onClose}
                    iconColor={theme.textPrimary}
                    iconButton
                    icon={'Close'}
                    iconButtonSmall
                />
            </View>
            <Block onSubmit={onSubmit}>
                <div>
                    <H2>{t('wallet_create_number')}</H2>
                    <Body>
                        {t('wallet_create_max_number').replace('%{maxCount}', String(maxCount))}
                    </Body>
                </div>
                <Input
                    ref={ref}
                    value={String(count)}
                    onChange={onChange}
                    label={t('wallet_create_number_label')}
                    isValid={isValid}
                />
                <Button
                    loading={loading}
                    size="large"
                    fullWidth
                    marginTop
                    primary
                    disabled={!isValid}
                    type="submit"
                >
                    {t('continue')}
                </Button>
                <View
                    hide={!onImport}
                    mt12
                    onClick={onImport}
                    button={t('import_mnemonic')}
                    sx={{ width: '100%' }}
                />
            </Block>
        </CenterContainer>
    );
};
