import { CenterContainer } from '@tonkeeper/uikit/dist/components/Layout';
import { Body2, H2 } from '@tonkeeper/uikit/dist/components/Text';
import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { Input } from '@tonkeeper/uikit/dist/components/fields/Input';
import { useTranslation } from '@web3-explorer/lib-translation';
import { View } from '@web3-explorer/uikit-view';
import React, { FC, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';

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

export const ChangeNameView: FC<{
    onClose?: () => void;
    defaultName: string;
    submitHandler: ({ name }: { name: string }) => void | Promise<void>;
}> = ({ onClose, defaultName, submitHandler }) => {
    const { t } = useTranslation();

    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.focus();
        }
    }, [ref.current]);

    const [name, setName] = useState(defaultName);

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
        e.preventDefault();
        submitHandler({ name });
    };

    const onChange = (value: string) => {
        setName(value);
    };

    const theme = useTheme();

    return (
        <CenterContainer>
            <View hide={!onClose} wh={32} zIdx={1} abs top={20} right={24} mt12>
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
                    <H2>{t('修改名称')}</H2>
                </div>
                <Input
                    ref={ref}
                    value={String(name)}
                    onChange={onChange}
                    label={t('请输入名称')}
                    isValid={true}
                />
                <Button size="large" fullWidth marginTop primary type="submit">
                    {t('continue')}
                </Button>
            </Block>
        </CenterContainer>
    );
};
