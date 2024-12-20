import { useVirtualizer } from '@tanstack/react-virtual';
import { fallbackRenderOver } from '@tonkeeper/uikit/dist/components/Error';
import {
    DesktopViewHeader,
    DesktopViewPageLayout
} from '@tonkeeper/uikit/dist/components/desktop/DesktopViewLayout';
import { JettonAsset, TonAsset } from '@tonkeeper/uikit/dist/components/home/Jettons';
import { useAssets } from '@tonkeeper/uikit/dist/state/home';
import { useMemo, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import styled, { css } from 'styled-components';

import { useAssetsDistribution } from '@tonkeeper/uikit/dist/state/asset';
import { View } from '@web3-explorer/uikit-view/dist/View';
import { LoadingView } from '../LoadingView';

const DesktopAssetStylesOverride = css`
    background-color: transparent;
    transition: background-color 0.15s ease-in-out;
    border-radius: 0;

    & > * {
        border-top: none !important;
    }
`;

const TonAssetStyled = styled(TonAsset)`
    margin: 0 -16px;

    ${DesktopAssetStylesOverride}
`;

const JettonAssetStyled = styled(JettonAsset)`
    ${DesktopAssetStylesOverride}
`;

const TokensHeaderContainer = styled(DesktopViewHeader)`
    flex-shrink: 0;
    justify-content: space-between;
    border-bottom: 1px solid ${p => p.theme.separatorCommon};
    padding-right: 0;
`;

const TokensPageBody = styled.div`
    padding: 0 1rem 1rem;

    .highlight-asset {
        background-color: ${p => p.theme.backgroundContentTint};
    }
`;

const HideButton = styled.button`
    border: none;
    background-color: transparent;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    color: ${p => p.theme.textAccent};
`;

const Divider = styled.div`
    height: 1px;
    background-color: ${p => p.theme.separatorCommon};
    margin: 0 -16px;
    width: calc(100% + 32px);
`;

const itemSize = 77;

const DesktopTokensPayload = ({ onClick }: { onClick: (adr: string) => void }) => {
    const [assets] = useAssets();

    const { data: distribution } = useAssetsDistribution();
    const tonRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const sortedAssets = useMemo(() => {
        return assets?.ton?.jettons?.balances ?? [];
    }, [assets]);

    const rowVirtualizer = useVirtualizer({
        count: sortedAssets.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => itemSize,
        getItemKey: index => sortedAssets[index].jetton.address,
        paddingStart: itemSize
    });
    // console.log({ sortedAssets, assets, distribution });
    return (
        <DesktopViewPageLayout ref={containerRef}>
            {!assets && (
                <View absFull empty>
                    <LoadingView noBgColor loading={true} />
                </View>
            )}
            <TokensPageBody
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {assets && sortedAssets && sortedAssets.length === 0 && (
                    <>
                        <TonAssetStyled onClick={onClick} ref={tonRef} info={assets.ton.info} />
                        <Divider />
                    </>
                )}
                {sortedAssets && assets && distribution && (
                    <>
                        <TonAssetStyled onClick={onClick} ref={tonRef} info={assets.ton.info} />
                        <Divider />
                        {rowVirtualizer.getVirtualItems().map(virtualRow => (
                            <div
                                key={virtualRow.index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`
                                }}
                            >
                                <ErrorBoundary
                                    fallbackRender={fallbackRenderOver(
                                        'Failed to display tokens list'
                                    )}
                                >
                                    <JettonAssetStyled
                                        onClick={onClick}
                                        jetton={sortedAssets[virtualRow.index]}
                                    />
                                    <Divider />
                                </ErrorBoundary>
                            </div>
                        ))}
                    </>
                )}
            </TokensPageBody>
        </DesktopViewPageLayout>
    );
};

export const DesktopTokens = ({ onClick }: { onClick: (adr: string) => void }) => {
    return (
        <ErrorBoundary fallbackRender={fallbackRenderOver('Failed to display desktop tokens')}>
            <DesktopTokensPayload onClick={onClick} />
        </ErrorBoundary>
    );
};
