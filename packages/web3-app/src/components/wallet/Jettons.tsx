import { Address } from '@ton/core';
import { CryptoCurrency } from '@tonkeeper/core/dist/entries/crypto';
import { Account, JettonBalance, JettonsBalances } from '@tonkeeper/core/dist/tonApiV2';
import { TronBalances } from '@tonkeeper/core/dist/tronApi';
import { formatDecimals } from '@tonkeeper/core/dist/utils/balance';
import { ListBlock, ListItem } from '@tonkeeper/uikit/dist/components/List';
import { useAppContext } from '@tonkeeper/uikit/dist/hooks/appContext';
import { useFormatBalance } from '@tonkeeper/uikit/dist/hooks/balance';
import { AppRoute } from '@tonkeeper/uikit/dist/libs/routes';
import { toTokenRate, useFormatFiat, useRate } from '@tonkeeper/uikit/dist/state/rates';
import { useTranslation } from '@web3-explorer/lib-translation';
import { FC, forwardRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListItemPayload, TokenLayout, TokenLogo } from './TokenLayout';

export interface TonAssetData {
    info: Account;
    jettons: JettonsBalances;
}

export interface AssetData {
    ton: TonAssetData;
    tron: TronBalances;
}

export interface AssetProps {
    assets: AssetData;
}

export const TonAsset = forwardRef<
    HTMLDivElement,
    {
        info: Account;
        className?: string;
        onClick?: (adr: string) => void;
    }
>(({ info, className, onClick }, ref) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const amount = useMemo(() => formatDecimals(info.balance), [info.balance]);
    const balance = useFormatBalance(amount);

    const { data } = useRate(CryptoCurrency.TON);
    const { fiatPrice, fiatAmount } = useFormatFiat(data, amount);

    return (
        <ListItem
            onClick={() => (onClick ? onClick('ton') : navigate(AppRoute.coins + '/ton'))}
            className={className}
            ref={ref}
        >
            <ListItemPayload>
                <TokenLogo src="https://wallet.tonkeeper.com/img/toncoin.svg" />
                <TokenLayout
                    name={t('Toncoin')}
                    symbol={CryptoCurrency.TON}
                    balance={balance}
                    secondary={fiatPrice}
                    fiatAmount={fiatAmount}
                    rate={data}
                />
            </ListItemPayload>
        </ListItem>
    );
});

export const JettonAsset = forwardRef<
    HTMLDivElement,
    {
        jetton: JettonBalance;
        className?: string;
        onClick?: (adr: string) => void;
    }
>(({ jetton, onClick, className }, ref) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { fiat } = useAppContext();
    const [amount, address] = useMemo(
        () => [
            formatDecimals(jetton.balance, jetton.jetton.decimals),
            Address.parse(jetton.jetton.address).toString()
        ],
        [jetton]
    );
    const balance = useFormatBalance(amount, jetton.jetton.decimals);

    const data = useMemo(
        () => (jetton.price ? toTokenRate(jetton.price, fiat) : undefined),
        [jetton.price, fiat]
    );
    const { fiatPrice, fiatAmount } = useFormatFiat(data, amount);
    const verification = jetton.jetton.symbol === 'W3C' ? 'whitelist' : jetton.jetton.verification;
    return (
        <ListItem
            onClick={() =>
                onClick
                    ? onClick(jetton.jetton.address)
                    : navigate(AppRoute.coins + `/${encodeURIComponent(jetton.jetton.address)}`)
            }
            className={className}
            ref={ref}
        >
            <ListItemPayload>
                <TokenLogo src={jetton.jetton.image} />
                <TokenLayout
                    name={jetton.jetton.name ?? t('Unknown_COIN')}
                    verification={verification}
                    symbol={jetton.jetton.symbol}
                    balance={balance}
                    secondary={fiatPrice}
                    fiatAmount={fiatAmount}
                    rate={data}
                />
            </ListItemPayload>
        </ListItem>
    );
});

export const JettonList: FC<AssetProps> = ({
    assets: {
        ton: { info, jettons },
        tron: _tron
    }
}) => {
    return (
        <>
            <ListBlock noUserSelect>
                <TonAsset info={info} />
                {/* TODO: ENABLE TRON */}
                {/* <TronAssets tokens={tron} /> */}
            </ListBlock>
            <ListBlock noUserSelect>
                {jettons.balances.map(jetton => (
                    <JettonAsset key={jetton.jetton.address} jetton={jetton} />
                ))}
            </ListBlock>
        </>
    );
};
