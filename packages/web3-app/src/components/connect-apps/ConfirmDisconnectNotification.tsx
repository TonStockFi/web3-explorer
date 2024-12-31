import { Button } from '@tonkeeper/uikit/dist/components/fields/Button';
import { Notification } from '@tonkeeper/uikit/dist/components/Notification';
import { Label1 } from '@tonkeeper/uikit/dist/components/Text';
import { usePrevious } from '@tonkeeper/uikit/dist/hooks/usePrevious';
import { useTranslation } from '@web3-explorer/lib-translation';
import { FC } from 'react';
import { styled } from 'styled-components';
import { formatDappUrl } from '../../common/utils';

const NotificationText = styled.div`
    text-align: center;
    margin-bottom: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ButtonsBlock = styled.div`
    display: flex;
    gap: 8px;

    > * {
        flex: 1;
    }
`;

export const ConfirmDisconnectNotification: FC<{
    isOpen: boolean;
    onClose: (confirmed?: boolean) => void;
    app?: { url: string } | 'all';
}> = ({ isOpen, onClose, app }) => {
    const { t } = useTranslation();
    const prev = usePrevious(app);

    const appWithFallback = app || prev;

    return (
        <Notification isOpen={isOpen} handleClose={() => onClose(false)}>
            {() => (
                <>
                    <NotificationText>
                        <Label1>
                            {appWithFallback === 'all' ? (
                                t('disconnect_all_apps_confirm')
                            ) : (
                                <>
                                    {t('disconnect')}&nbsp;{formatDappUrl(appWithFallback?.url)}?
                                </>
                            )}
                        </Label1>
                    </NotificationText>
                    <ButtonsBlock>
                        <Button secondary onClick={() => onClose(false)}>
                            {t('cancel')}
                        </Button>
                        <Button primary onClick={() => onClose(true)}>
                            {t('disconnect')}
                        </Button>
                    </ButtonsBlock>
                </>
            )}
        </Notification>
    );
};
