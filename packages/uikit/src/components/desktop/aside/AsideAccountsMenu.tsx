import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import styled from 'styled-components';
import { useTranslation } from '../../../hooks/translation';
import { useIsScrolled } from '../../../hooks/useIsScrolled';
import { useMutateUserUIPreferences, useUserUIPreferences } from '../../../state/theme';
import { useAccountsState, useActiveAccount } from '../../../state/wallet';
import { fallbackRenderOver } from '../../Error';
import { ArrowLeftIcon, PlusIcon } from "../../Icon";
import { ScrollContainer } from '../../ScrollContainer';
import { Label2 } from '../../Text';
import { AsideMenuIconItem, AsideMenuItem } from "../../shared/AsideItem";
import { AsideHeader } from './AsideHeader';
import { useAsideActiveRoute } from '../../../hooks/desktop/useAsideActiveRoute';
import { AsideMenuAccount, AsideResizeHandle } from './AsideMenu';
import { AppRoute, ImportRoute, SettingsRoute } from "../../../libs/routes";
import { useNavigate } from "react-router-dom";
import { View } from "@web3-explorer/uikit-view";

const AsideContainer = styled.div<{ width: number }>`
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    width: ${p => p.width}px;
    border-right: 1px solid ${p => p.theme.backgroundContentAttention};

    * {
        user-select: none;
    }
`;

const AsideContentContainer = styled.div`
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    height: calc(100% - 69px);

    background: ${p => p.theme.backgroundContent};
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.5rem 0;
`;

const DividerStyled = styled.div<{ isHidden?: boolean }>`
    opacity: ${p => (p.isHidden ? 0 : 1)};
    height: 1px;
    background-color: ${p => p.theme.separatorCommon};
    margin: 0 -0.5rem;
    width: calc(100% + 1rem);
    transition: opacity 0.15s ease-in-out;
`;

const IconWrapper = styled.div`
    color: ${p => p.theme.iconSecondary};
    height: fit-content;

    > svg {
        display: block;
    }
`;
const BorderDiv = styled.div`
    height: 1px;
    border-bottom: 1px solid ${p => p.theme.backgroundContentAttention};
`
const AsideMenuBottom = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    background: ${p => p.theme.backgroundContent};
    padding-bottom: 0.5rem;
`;

export const AccountsPager = ({total,page,limit,setPage}:{total:number;page:number,limit:number,setPage:(page:number)=>void}) => {
    if(total <= limit ){
        return null;
    }
    return (
    <View py={4} row jSpaceBetween aCenter px={6}>
        <AsideMenuIconItem disabled={page === 0} onClick={()=>{
            setPage(page-1 < 0 ? 0 :page-1)
        }}>
            <IconWrapper>
                <ArrowLeftIcon />
            </IconWrapper>
        </AsideMenuIconItem>
        <Label2>{page + 1} / {1 + Math.floor(total/limit)}</Label2>

        <AsideMenuIconItem disabled={limit * (page+1) >= total} style={{transform: "rotate(180deg)"}} onClick={()=>{
            if(limit * (page+1) < total){
                setPage(page+1)
            }
        }}>
            <IconWrapper>
                <ArrowLeftIcon />
            </IconWrapper>
        </AsideMenuIconItem>
    </View>
  )
}
const AsideAccountsMenuPayload: FC<{ className?: string }> = ({ className }) => {
    const { t } = useTranslation();
    const accounts = useAccountsState();
    const total = accounts.length;
    const limit = 20
    const [page, setPage] = useState(0);
    const accountsList = accounts.slice(page * limit,(page + 1) * limit)
    const activeAccount = useActiveAccount();
    const { ref, closeBottom } = useIsScrolled();
    const navigate = useNavigate();
    const activeRoute = useAsideActiveRoute();

    const [asideWidth, setAsideWidth] = useState(250);
    const asideWidthRef = useRef(asideWidth);
    const isResizing = useRef(false);
    const { data: uiPreferences } = useUserUIPreferences();
    const { mutate: mutateWidth } = useMutateUserUIPreferences();

    useLayoutEffect(() => {
        if (uiPreferences?.asideWidth) {
            setAsideWidth(uiPreferences?.asideWidth);
            asideWidthRef.current = uiPreferences?.asideWidth;
        }
    }, [uiPreferences?.asideWidth]);

    useEffect(() => {
        const minWidth = 200;
        const maxWidth = 500;
        const onMouseUp = () => {
            document.body.style.cursor = 'unset';
            document.documentElement.classList.remove('no-user-select');
            isResizing.current = false;
            mutateWidth({ asideWidth: asideWidthRef.current });
        };

        const onMouseMove = (e: MouseEvent) => {
            if (isResizing.current) {
                let newWidth =
                    e.pageX < minWidth ? minWidth : e.pageX > maxWidth ? maxWidth : e.pageX;
                newWidth = newWidth - 64;
                setAsideWidth(newWidth);
                asideWidthRef.current = newWidth;
            }
        };

        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        return () => {
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
        };
    }, [mutateWidth]);
    return (
        <AsideContainer width={asideWidth}>
            <BorderDiv />
            <AsideContentContainer className={className}>
                <ScrollContainer ref={ref}>
                    {accountsList.map(account => (
                        <AsideMenuAccount
                            disableHover={true}
                            key={account.id}
                            account={account}
                            isSelected={!activeRoute && activeAccount.id === account.id}
                        />
                    ))}
                </ScrollContainer>
                <AsideMenuBottom>
                    <DividerStyled isHidden={false} style={{marginBottom:4}} />
                    <AccountsPager total={total} limit={limit} page={page} setPage={(page:number)=>setPage(page)}/>
                    <AsideMenuItem isSelected={false} onClick={() => {
                        navigate(AppRoute.import + ImportRoute.createBatch);
                    }}>
                        <IconWrapper>
                            <PlusIcon />
                        </IconWrapper>
                        <Label2>{t('aside_add_wallet')}</Label2>
                    </AsideMenuItem>
                </AsideMenuBottom>
            </AsideContentContainer>
            <AsideResizeHandle
                onMouseDown={() => {
                    isResizing.current = true;
                    document.body.style.cursor = 'col-resize';
                    document.documentElement.classList.add('no-user-select');
                }}
            />
        </AsideContainer>
    );
};

export const AsideAccountsMenu: FC<{ className?: string }> = ({ className }) => {
    return (
        <ErrorBoundary fallbackRender={fallbackRenderOver('Failed to load aside menu')}>
            <AsideAccountsMenuPayload className={className} />
        </ErrorBoundary>
    );
};
