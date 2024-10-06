import React, { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/translation';
import { CenterContainer } from '../Layout';
import { Body2, H2 } from "../Text";
import { Button } from '../fields/Button';
import { Input } from '../fields/Input';
import { BackButtonBlock, LaterButton } from "../BackButton";
import { useNavigate } from "react-router-dom";

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
    submitHandler: ({ count }: { count: number }) => void;
}> = ({submitHandler }) => {
    const { t } = useTranslation();

    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.focus();
        }
    }, [ref.current]);

    const [count, setCount] = useState("10");

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
        e.preventDefault();
        submitHandler({ count:Number(count) });
    };

    const onChange = (value: string) => {
        setCount(value);
    };
    const maxCount = 1000
    const isValid = Number(count) >= 1 || Number(count) <= maxCount;
    const navigate = useNavigate();

    return (
        <CenterContainer>
            <BackButtonBlock onClick={()=>{navigate(-1)}} />
            <Block onSubmit={onSubmit}>
                <div>
                    <H2>{t("请输入创建的数量")}</H2>
                    <Body>{t("每次创建的数量不能大于")}{maxCount}</Body>
                </div>
                <Input
                    ref={ref}
                    value={String(count)}
                    onChange={onChange}
                    label={"创建的数量"}
                    isValid={isValid}
                />
                <Button
                    size="large"
                    fullWidth
                    marginTop
                    primary
                    disabled={!isValid}
                    type="submit"
                >
                    {t('continue')}
                </Button>
            </Block>
        </CenterContainer>
    );
};
