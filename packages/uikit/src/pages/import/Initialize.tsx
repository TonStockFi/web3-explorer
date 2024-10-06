import { FC, PropsWithChildren } from "react";
import styled, { css } from "styled-components";
import { CenterContainer } from "../../components/Layout";
import { H1 } from "../../components/Text";
import { Button } from "../../components/fields/Button";
import { useAppSdk } from "../../hooks/appSdk";
import { useTranslation } from "../../hooks/translation";
import { AppRoute, ImportRoute } from "../../libs/routes";
import { useNavigate } from "react-router-dom";

const Block = styled.div<{ fullHeight: boolean }>`
    display: flex;
    flex-direction: column;
    min-height: var(--app-height);
    padding: 1rem 1rem;
    box-sizing: border-box;
    position: relative;

    ${p =>
        p.theme.displayType === 'full-width' &&
        css`
            height: auto;
            min-height: unset;
            position: static;
        `}

    ${props =>
        props.fullHeight
            ? css`
                  justify-content: space-between;
              `
            : css`
                  justify-content: center;
              `}
`;

export const InitializeContainer: FC<
    PropsWithChildren<{ fullHeight?: boolean; className?: string }>
> = ({ fullHeight = true, children, className }) => {
    return (
        <Block fullHeight={fullHeight} className={className}>
            {children}
        </Block>
    );
};

const Accent = styled.span`
    color: ${props => props.theme.accentBlue};
`;

const Title = styled(H1)`
    margin-bottom: 2rem;
    user-select: none;
`;

const Initialize: FC = () => {
    const { t } = useTranslation();
    const sdk = useAppSdk();
    const navigate = useNavigate();
    const onClick = () => {
        sdk.twaExpand && sdk.twaExpand();
        sdk.requestExtensionPermission().then(() => {
          navigate(AppRoute.import + ImportRoute.createBatch)
        });
    };

    return (
        <CenterContainer>
            <Title>
                {t('intro_title')}
                <Accent>Web3 Explorer</Accent>
            </Title>
            <Button size="large" fullWidth primary marginTop onClick={onClick}>
                {t('intro_continue_btn')}
            </Button>
        </CenterContainer>
    );
};

export default Initialize;
