import {
    DesktopViewHeader,
    DesktopViewPageLayout
} from '@tonkeeper/uikit/dist/components/desktop/DesktopViewLayout';

import {
    AssetHistoryFilter,
    OtherHistoryFilters
} from '@tonkeeper/uikit/dist/components/desktop/history/DesktopHistoryFilters';
import { SpinnerRing } from '@tonkeeper/uikit/dist/components/Icon';
import { useFetchNext } from '@tonkeeper/uikit/dist/hooks/useFetchNext';
import { useFetchFilteredActivity } from '@tonkeeper/uikit/dist/state/activity';
import { getMixedActivity } from '@tonkeeper/uikit/dist/state/mixedActivity';
import { View } from '@web3-explorer/uikit-view';
import { FC, useMemo, useRef } from 'react';
import styled from 'styled-components';
import EmptyActivity from '../../../components/EmptyActivity';
import { DesktopHistory } from '../../../components/history/DesktopHistory';

const HistoryPageWrapper = styled(DesktopViewPageLayout)`
    overflow: auto;
    min-height: 100%;
`;

const HistoryContainer = styled.div`
    overflow-x: auto;
    overflow-y: hidden;
    min-height: calc(100% - 53px);
`;

const HistoryHeaderContainer = styled(DesktopViewHeader)`
    flex-shrink: 0;
    justify-content: flex-start;
    background-color: unset;
    padding-right: 0;
    > *:last-child {
        margin-left: auto;
    }
`;

const FiltersWrapper = styled.div`
    display: flex;
`;

const LoaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;

    > * {
        transform: scale(1.5);
    }
`;

export const DesktopHistoryPage: FC = () => {
    const ref = useRef<HTMLDivElement>(null);

    const {
        isFetched: isTonFetched,
        fetchNextPage: fetchTonNextPage,
        hasNextPage: hasTonNextPage,
        isFetchingNextPage: isTonFetchingNextPage,
        data: tonEvents
    } = useFetchFilteredActivity();

    const isFetchingNextPage = isTonFetchingNextPage;

    useFetchNext(hasTonNextPage, isFetchingNextPage, fetchTonNextPage, true, ref);

    const activity = useMemo(() => {
        return getMixedActivity(tonEvents, undefined);
    }, [tonEvents]);

    if (isTonFetched!) {
        return (
            <HistoryPageWrapper>
                <HistoryHeaderContainer borderBottom={false}>
                    <FiltersWrapper>
                        <AssetHistoryFilter />
                        <OtherHistoryFilters />
                    </FiltersWrapper>
                </HistoryHeaderContainer>
                <HistoryContainer>
                    <LoaderContainer>
                        <SpinnerRing />
                    </LoaderContainer>
                </HistoryContainer>
            </HistoryPageWrapper>
        );
    }

    return (
        <HistoryPageWrapper ref={ref}>
            <View h={28} rowVCenter jEnd mb12>
                <FiltersWrapper>
                    <AssetHistoryFilter />
                    <OtherHistoryFilters />
                </FiltersWrapper>
            </View>
            <HistoryContainer>
                {activity.length === 0 && (
                    <View mt={120}>
                        <EmptyActivity />
                    </View>
                )}
                {activity.length > 0 && (
                    <DesktopHistory activity={activity} isFetchingNextPage={isFetchingNextPage} />
                )}
            </HistoryContainer>
        </HistoryPageWrapper>
    );
};
