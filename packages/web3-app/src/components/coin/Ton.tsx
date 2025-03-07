import { useInfiniteQuery } from '@tanstack/react-query';
import { BLOCKCHAIN_NAME, CryptoCurrency } from '@tonkeeper/core/dist/entries/crypto';

import { Account, AccountsApi } from '@tonkeeper/core/dist/tonApiV2';
import { formatDecimals } from '@tonkeeper/core/dist/utils/balance';
import { InnerBody } from '@tonkeeper/uikit/dist/components/Body';
import { CoinSkeletonPage } from '@tonkeeper/uikit/dist/components/Skeleton';
import { SubHeader } from '@tonkeeper/uikit/dist/components/SubHeader';
import { ActivityList } from '@tonkeeper/uikit/dist/components/activity/ActivityGroup';
import { HomeActions } from '@tonkeeper/uikit/dist/components/home/TonActions';
import { CoinInfo } from '@tonkeeper/uikit/dist/components/jettons/Info';
import { useAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { useFormatBalance } from '@tonkeeper/uikit/dist/hooks/balance';
import { useFetchNext } from '@tonkeeper/uikit/dist/hooks/useFetchNext';
import { QueryKey } from '@tonkeeper/uikit/dist/libs/queryKey';
import { useFormatFiat, useRate } from '@tonkeeper/uikit/dist/state/rates';
import { groupAndFilterTonActivityItems } from '@tonkeeper/uikit/dist/state/ton/tonActivity';
import { useActiveWallet, useWalletAccountInfo } from '@tonkeeper/uikit/dist/state/wallet';
import { useTranslation } from '@web3-explorer/lib-translation';
import { FC, useMemo, useRef } from 'react';

const TonHeader: FC<{ info: Account }> = ({ info: { balance } }) => {
    const { t } = useTranslation();

    const amount = useMemo(() => formatDecimals(balance), [balance]);
    const total = useFormatBalance(amount);

    const { data } = useRate(CryptoCurrency.TON);
    const { fiatAmount } = useFormatFiat(data, amount);

    return (
        <CoinInfo
            amount={total}
            symbol="TON"
            price={fiatAmount}
            description={t('Ton_page_description')}
            image="https://wallet.tonkeeper.com/img/toncoin.svg"
        />
    );
};

export const TonPage = () => {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);

    const { data: info } = useWalletAccountInfo();

    const { api, standalone } = useAppContext();
    const wallet = useActiveWallet();
    const { fetchNextPage, hasNextPage, isFetchingNextPage, data, isFetched } = useInfiniteQuery({
        queryKey: [wallet.rawAddress, QueryKey.activity, 'ton'],
        queryFn: ({ pageParam = undefined }) =>
            new AccountsApi(api.tonApiV2).getAccountEvents({
                accountId: wallet.rawAddress,
                limit: 20,
                beforeLt: pageParam,
                subjectOnly: true
            }),
        getNextPageParam: (lastPage: any) => (lastPage.nextFrom > 0 ? lastPage.nextFrom : undefined)
    });

    useFetchNext(hasNextPage, isFetchingNextPage, fetchNextPage, standalone, ref);

    const activity = useMemo(() => {
        return data ? groupAndFilterTonActivityItems(data) : undefined;
    }, [data]);

    if (!info) {
        return <CoinSkeletonPage activity={4} />;
    }

    return (
        <>
            <SubHeader title={t('Toncoin')} />
            <InnerBody ref={ref}>
                <TonHeader info={info} />
                <HomeActions chain={BLOCKCHAIN_NAME.TON} />
                <ActivityList
                    isFetched={isFetched}
                    isFetchingNextPage={isFetchingNextPage}
                    tonEvents={activity}
                />
            </InnerBody>
        </>
    );
};
