import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import styled from "styled-components";
import { useMutateUserUIPreferences, useUserUIPreferences } from "../../../state/theme";
import { fallbackRenderOver } from "../../Error";
import { ArrowLeftIcon } from "../../Icon";
import { Label2 } from "../../Text";
import { AsideMenuIconItem } from "../../shared/AsideItem";
import { AccountWalletsList, AsideResizeHandle } from "./AsideMenu";
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
`;

export const AccountsPager = ({
    total,
    page,
    limit,
    setPage
}: {
    total: number;
    page: number;
    limit: number;
    setPage: (page: number) => void;
}) => {
    if (total <= limit) {
        return null;
    }
    const totalPages = Math.ceil(total / limit);
    return (
        <View py={4} row jSpaceBetween aCenter px={6}>
            <AsideMenuIconItem
                disabled={page === 0}
                onClick={() => {
                    setPage(page - 1 < 0 ? 0 : page - 1);
                }}
            >
                <IconWrapper>
                    <ArrowLeftIcon />
                </IconWrapper>
            </AsideMenuIconItem>
            <Label2>
                {page + 1} / {totalPages}
            </Label2>

            <AsideMenuIconItem
                disabled={page + 1 >= totalPages}
                style={{ transform: 'rotate(180deg)' }}
                onClick={() => {
                    if (page + 1 < totalPages) {
                        setPage(page + 1);
                    }
                }}
            >
                <IconWrapper>
                    <ArrowLeftIcon />
                </IconWrapper>
            </AsideMenuIconItem>
        </View>
    );
};
const AsideAccountsMenuPayload: FC<{ className?: string }> = ({ className }) => {
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
                <AccountWalletsList />
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
