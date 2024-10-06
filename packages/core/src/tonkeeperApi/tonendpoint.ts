//@ts-nocheck
import { TargetEnv } from '../AppSdk';
import { intlLocale } from '../entries/language';
import { Network } from '../entries/network';
import { DAppTrack } from '../service/urlService';
import { FetchAPI } from '../tonApiV2';

export interface BootParams {
    platform: 'ios' | 'android' | 'web' | 'desktop';
    lang: 'en' | 'ru' | string;
    build: string; // "2.8.0"
    network: Network;
    countryCode?: string | null;
}
interface BootOptions {
    fetchApi?: FetchAPI;
    basePath?: string;
}

type TonendpointResponse<Data> = { success: false } | { success: true; data: Data };

export interface TonendpointConfig {
    VersionForAutoUpdate?:string;
    isExchangeEnabled?:string;
    flags?: { [key: string]: boolean };
    tonendpoint: string;

    tonApiKey?: string;
    tonApiV2Key?: string;
    tonapiIOEndpoint?: string;

    amplitudeKey?: string;

    exchangePostUrl?: string;
    supportLink?: string;
    tonkeeperNewsUrl?: string;
    mam_learn_more_url?: string;

    mercuryoSecret?: string;
    neocryptoWebView?: string;

    directSupportUrl?: string;
    faq_url?: string;

    accountExplorer?: string;
    transactionExplorer?: string;
    NFTOnExplorerUrl?: string;

    featured_play_interval?: number;

    notcoin_burn_date?: number;
    notcoin_burn_addresses?: string[];

    web_swaps_url?: string;
    web_swaps_referral_address?: string;

    mercuryo_otc_id?: string;

    scam_api_url?: string;

    mam_max_wallets_without_pro?: number;

    /**
     * @deprecated use ton api
     */
    tonEndpoint: string;
    /**
     * @deprecated use ton api
     */
    tonEndpointAPIKey?: string;

    multisig_help_url?: string;

    multisig_about_url?: string;
}

const defaultTonendpoint = 'https://api.tonkeeper.com'; //  'http://localhost:1339';

export const defaultTonendpointConfig: TonendpointConfig = {
    tonendpoint: defaultTonendpoint,
    tonEndpoint: '',
    flags: {}
};

const defaultFetch: FetchAPI = (input, init) => window.fetch(input, init);

export class Tonendpoint {
    public params: BootParams;

    public fetchApi: FetchAPI;

    public basePath: string;

    public readonly targetEnv: TargetEnv;

    constructor(
        {
            lang = 'en',
            build = '3.0.0',
            network = Network.MAINNET,
            platform = 'web',
            countryCode,
            targetEnv
        }: Partial<BootParams> & { targetEnv: TargetEnv },
        { fetchApi = defaultFetch, basePath = defaultTonendpoint }: BootOptions
    ) {
        this.targetEnv = targetEnv;
        this.params = { lang, build, network, platform, countryCode };
        this.fetchApi = fetchApi;
        this.basePath = basePath;
    }

    setCountryCode = (countryCode?: string | null | undefined) => {
        this.params.countryCode = countryCode;
    };

    toSearchParams = (
        rewriteParams?: Partial<BootParams>,
        additionalParams?: Record<string, string | number>
    ) => {
        const params = new URLSearchParams({
            lang: intlLocale(rewriteParams?.lang ?? this.params.lang),
            build: rewriteParams?.build ?? this.params.build,
            chainName:
                (rewriteParams?.network ?? this.params.network) === Network.TESTNET
                    ? 'testnet'
                    : 'mainnet',
            platform: rewriteParams?.platform ?? this.params.platform
        });
        const countryCode = rewriteParams?.countryCode ?? this.params.countryCode;

        if (countryCode) {
            params.append('countryCode', countryCode);
        }

        if (!additionalParams) {
            return params.toString();
        }

        for (const key in additionalParams) {
            params.append(key, additionalParams[key].toString());
        }
        return params.toString();
    };

    boot = async (): Promise<TonendpointConfig> => {
        // const response = await this.fetchApi(
        //     `https://boot.tonkeeper.com/keys?${this.toSearchParams()}`,
        //     {
        //         method: 'GET'
        //     }
        // );

        // return response.json();
        return {
            "VersionForAutoUpdate": "4.12.1",
            "isExchangeEnabled": "true",
            "amplitudeKey": "d3f88d166cd4f4718125ec8bc0bcedf6",
            "tonEndpoint": "https://toncenter.com/api/v2/jsonRPC",
            "tonApiEndpoint": "https://toncenter.com/api/v2/",
            "tonapiWsEndpoint": "wss://keeper-ws.tonapi.io/v2/websocket",
            "tonapi_sse_endpoint": "https://rt.tonapi.io",
            "neocryptoWebView": "https://neocrypto.net/buy.html",
            "supportLink": "mailto:support@tonkeeper.com",
            "NFTOnExplorerUrl": "https://tonviewer.com/%s?section=nft",
            "transactionExplorer": "https://tonviewer.com/transaction/%s",
            "accountExplorer": "https://tonviewer.com/%s",
            "default_wallet_version": "v5R1",
            "mercuryoSecret": "yMd6dkP9SVip98Nw",
            "batteryHost": "https://battery.tonkeeper.com",
            "batteryMeanFees": "0.03",
            "holdersAppEndpoint": "https://app.holders.io",
            "subscriptionsHost": "https://notasubscriptions.tonkeeper.com",
            "tonapiV2Endpoint": "https://keeper.tonapi.io",
            "tonapiMainnetHost": "https://keeper.tonapi.io",
            "tonapiTestnetHost": "https://testnet.tonapi.io",
            "tonapiIOEndpoint": "https://keeper.tonapi.io",
            "stonfiUrl": "https://tonkeeper.ston.fi/swap",
            "tonNFTsMarketplaceEndpoint": "https://ton.diamonds",
            "tonNFTsAPIEndpoint": "https://keeper.tonapi.io",
            "tonApiKey": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiMjoyIl0sImp0aSI6IlY0NEIzVFdCM01CUlo3SVciLCJzY29wZSI6ImNsaWVudCIsInN1YiI6InRvbmFwaSJ9.Eh7gz33WRgoaCtZHmQDqJxcD4pJvTGQovEYRqKkN2TshLckcQ_k4btDQQXTURFcRKZkZJSc0MH9tqwuwHPrEvUYKhLxQ9gKLpnDzDsBVmnRG-nJ2yOyqqCeY83EaxrIDDwbmf3vSQP9SaqsMtNUzVTLtsn_RZ41wP594e6uuBXZJPV9g4auHMHj12wvMSL4_vBoEVCrZXP6qktCtUDpqnsBkT9T2iSd61DIC8tOePjrrR3WPqj4qX3w6obCGnc20ZkCHX_yf3XhGWftub7y4zqJ5NWbVcFI4eNdYN5yEEr_9s8v3VCoZqBKF2gUJT2zf7NA5NvYWwX1_EfzC0F3udQ",
            "tonApiV2Key": "AF77F5JNEUSNXPQAAAAMDXXG7RBQ3IRP6PC2HTHL4KYRWMZYOUQGDEKYFDKBETZ6FDVZJBI",
            "appsflyerDevKey": "FtLLvi4MV7hYJDN8Q6KU5m",
            "appsflyerAppId": "1587742107",
            "cachedMediaEndpoint": "https://cache.tonapi.io/imgproxy",
            "cachedMediaKey": "bd03f42aa324a265bc66c9192b29ae71cdb110245e32259b03ed57d901729afb",
            "cachedMediaSalt": "9bd38ff86794264af85aed9384692a573c6a52bb7cd2c7bdaf3ee35392cefbd6",
            "directSupportUrl": "https://t.me/tonkeeper",
            "aptabaseEndpoint": "https://anonymous-analytics.tonkeeper.com",
            "aptabaseAppKey": "A-SH-4314447490",
            "batteryRefundEndpoint": "https://bat.tonkeeper.com",
            "disable_battery_promo_module": true,
            "disable_battery_iap_module": true,
            "disable_battery": true,
            "disable_battery_send": true,
            "battery_beta": true,
            "batteryReservedAmount": "0.065",
            "batteryMeanPrice_swap": "0.13",
            "batteryMeanPrice_jetton": "0.025",
            "batteryMeanPrice_nft": "0.01",
            "disable_show_unverified_token": false,
            "exclude_jetton_chart_periods": false,
            "tonkeeperNewsUrl": "https://t.me/tonkeeper_chinese",
            "telegram_global": "https://t.me/tonkeeper_chinese",
            "stakingInfoUrl": "https://ton.org/stake",
            "tonCommunityUrl": "https://t.me/toncoin",
            "tonCommunityChatUrl": "https://t.me/toncoin_chat",
            "exchangePostUrl": "https://t.me/toncoin/703",
            "featured_play_interval": 3000,
            "faq_url": "https://tonkeeper.helpscoutdocs.com",
            "notcoin_burn": true,
            "notcoin_burn_date": 1715864400,
            "notcoin_burn_addresses": [
                "0:0F65AB9654F51C9B6854253F67DFAA71CE7121978EAB127D5BCC15CDD1163FCA",
                "0:12826D10BF78761F6985D16D3A8A43EA62AD9CB53DDDC973091FFB2F6C428A07",
                "0:2B9663FE4615481B6C801466723D97CCDE6D1871CC66A6FA118BAB204735A700",
                "0:3AA4BFACA58A99A750A4EA8DEBA58E390A5F9BBCB316FE3DEA7557A33A4516A4",
                "0:49FDE8588EE99029B5DF594B9ED4A1CA5DD4E6D46B98241D058F6493FC3C0E46",
                "0:519984A3C61F71959A54A849868C5E548EE908F6FFC29B69024EEE02A019F75E",
                "0:648AA9DC77B0054F9FF6DC7F91A00D95CA793E373ABF74BA1E31546D84053D44",
                "0:7F3B34C75DBCED0017B440782BE0FB4057C4FAE0B47A683BA75E0680A2284E77",
                "0:8BFB1E642E0EAD295346AF222D4EE8FAB46DC51F99A1504BB4C51A9073E91B12",
                "0:99876C89E3A45A407DC06268C403C48C3178BBECE7A29F8FB796FAA41EC78802",
                "0:A12A8E482B788DA941D418307D82DCE30A33133ED9AC16A7A4B8203631DADE54",
                "0:BA0CD081BF4EFA4C896244C7CEB76D11A5B4BBACD2837D2932DD6AC511AA45B7",
                "0:C4FD715939869EFEB97764CB20042B514A662197C078CB605910FEE888604386",
                "0:DD76AA4603678F5D0178EC0D8348BDC617A6732159A299F336775E9C7729B2DA",
                "0:EFD2134D01A9A1625B42877A5326BAB7A1107D456D998446244CFE9F863E41B5",
                "0:F698FEF380EEFE8A650986A62BCB78B4EDA27F491E770DAA2432EA5F000A1BB7"
            ],
            "enabled_iaps": [
                "small",
                "medium",
                "large"
            ],
            "iap_packages": [
                {
                    "id": "large",
                    "user_proceed": 7.5,
                    "package_id_android": "large_pack",
                    "package_id_ios": "LargePack"
                },
                {
                    "id": "medium",
                    "user_proceed": 5,
                    "package_id_android": "medium_pack",
                    "package_id_ios": "MediumPack"
                },
                {
                    "id": "small",
                    "user_proceed": 2.5,
                    "package_id_android": "small_pack",
                    "package_id_ios": "SmallPack"
                }
            ],
            "disable_battery_crypto_recharge_module": false,
            "holdersService": "disabled",
            "web_swaps_url": "https://swap.tonkeeper.com",
            "web_swaps_referral_address": "0:f4684b10a661eaa395f87d4a660e6dfc3bec187a8b24f6f362c0c6b1d20f1b5d",
            "mercuryo_otc_id": "https://api.mercuryo.io/v1.6/get-otc-id",
            "scam_api_url": "https://scam.tonkeeper.com",
            "mam_learn_more_url": "https://tonkeeper.helpscoutdocs.com",
            "mam_max_wallets_without_pro": 3,
            "multisig_help_url": "https://tonkeeper.helpscoutdocs.com",
            "multisig_about_url": "https://tonkeeper.helpscoutdocs.com",
            "flags": {
                "disable_swap": false,
                "disable_exchange_methods": false,
                "disable_feedback_button": false,
                "disable_support_button": false,
                "disable_nft_markets": false,
                "disable_apperance": false,
                "disable_dapps": false,
                "disable_tonstakers": false,
                "tonstakers_beta": false,
                "address_style_nobounce": true,
                "address_style_notice": false,
                "address_style_settings": true,
                "disable_blur": false,
                "disable_legacy_blur": false,
                "disable_signer": false,
                "disable_ledger": false,
                "disable_v5r1": false
            }
        }
    };

    GET = async <Data>(
        path: string,
        rewriteParams?: Partial<BootParams>,
        additionalParams?: Record<string, string | number>
    ): Promise<Data> => {
        const response = await this.fetchApi(
            `${this.basePath}${path}?${this.toSearchParams(rewriteParams, additionalParams)}`,
            {
                method: 'GET'
            }
        );

        const result: TonendpointResponse<Data> = await response.json();
        if (!result.success) {
            throw new Error(`Failed to get "${path}" data`);
        }

        return result.data;
    };

    getFiatMethods = (countryCode?: string | null | undefined): Promise<TonendpoinFiatMethods> => {
        return this.GET('/fiat/methods', { countryCode });
    };

    getAppsPopular = (countryCode?: string | null | undefined): Promise<Recommendations> => {
        return this.GET('/apps/popular', { countryCode }, { track: this.getTrack() });
    };

    getTrack = (): DAppTrack => {
        switch (this.targetEnv) {
            case 'desktop':
                return 'desktop';
            case 'twa':
                return 'twa';
            case 'extension':
            case 'web':
            default:
                return 'extension';
        }
    };
}

export const getServerConfig = async (tonendpoint: Tonendpoint): Promise<TonendpointConfig> => {
    const result = await tonendpoint.boot();

    return {
        flags: {},
        ...result
    };
};

export interface TonendpoinFiatButton {
    title: string;
    url: string;
}
export interface TonendpoinFiatItem {
    id: string;
    disabled: boolean;
    title: string;
    subtitle: string;
    description: string;
    icon_url: string;
    action_button: TonendpoinFiatButton;
    badge: null;
    features: unknown[];
    info_buttons: TonendpoinFiatButton[];
    successUrlPattern: unknown;
}

export interface TonendpoinFiatCategory {
    items: TonendpoinFiatItem[];
    subtitle: string;
    title: string;
}

export interface LayoutByCountry {
    countryCode: string;
    currency: string;
    methods: string[];
}

export interface TonendpoinFiatMethods {
    layoutByCountry: LayoutByCountry[];
    defaultLayout: { methods: string[] };
    categories: TonendpoinFiatCategory[];
}

export interface CarouselApp extends PromotedApp {
    poster: string;
}

export interface PromotedApp {
    name: string;
    description: string;
    icon: string;
    url: string;
    textColor?: string;
}

export interface PromotionCategory {
    id: string;
    title: string;
    apps: PromotedApp[];
}

export interface Recommendations {
    categories: PromotionCategory[];
    apps: CarouselApp[];
}
