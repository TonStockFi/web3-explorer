import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { ArrowDownIcon } from '@tonkeeper/uikit/dist/components/Icon';
import { Body2, Label2 } from '@tonkeeper/uikit/dist/components/Text';
import { useAppSdk } from '@tonkeeper/uikit/dist/hooks/appSdk';
import { useTranslation } from '@web3-explorer/lib-translation';
import styled from 'styled-components';

const EmptyBody = styled.div`
    margin-top: -64px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

const BodyText = styled(Body2)`
    color: ${props => props.theme.textSecondary};
    margin-bottom: 1.5rem;
`;

const ButtonRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
`;

const ButtonStyled = styled(Button)`
    display: flex;
    gap: 6px;

    > svg {
        color: ${p => p.theme.buttonTertiaryForeground};
    }
`;

const EmptyActivity = () => {
    const { t } = useTranslation();
    const sdk = useAppSdk();

    return (
        <EmptyBody>
            <Label2 style={{ marginBottom: 6 }}>{t('activity_empty_transaction_title')}</Label2>
            <BodyText>{t('activity_empty_transaction_caption')}</BodyText>
            <ButtonRow>
                <ButtonStyled
                    size="small"
                    onClick={() => sdk.uiEvents.emit('receive', { method: 'receive', params: {} })}
                >
                    <ArrowDownIcon />
                    {t('wallet_receive')}
                </ButtonStyled>
            </ButtonRow>
        </EmptyBody>
    );
};

export default EmptyActivity;
