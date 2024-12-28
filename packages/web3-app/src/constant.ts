import { CHAIN, ChainListItem, MAIN_NAV_TYPE, MainNavListItem, ProPlan } from './types';
export const PRO_RECV_ADDRESS="UQDUawBs8JDdr3QR4dYDkJq2ic9_0yNRSp-6eq29MKZKUkT-"

export const W3C_JETTON_CONTRACT  = '0:3f145e2bd301b31329418ca3b8aea0d6c44f0ecfa85b5b412787d87c55284e76'
export const PRO_WHITE_LIST_MONTH="TK1jewM0JbFdb1f7mWsTlk17,1|TK0zTffTeEGskMtwdYGAl8I2,0|TK1z-z7apmAbgW_o6toLWx1T,0"
export const PRO_WHITE_LIST_YEAR="TK1jewM0JbFdb1f7mWsTlk17,2"
export const PRO_WHITE_LIST_LONG="TK2Auo2oNlYFYlpWNu-WKDuE"

export const P2E_ChatId = '7363481027';

export const W3C_ChatId = '7469429463';
export const SWAP_ChatId = '7469429463';

export const SERVICE_ChatId = '7187821521';
export const TASK_CENTER_ChatId = '7187821521';
export const BOT_ID_EXTESSION_CENTER = '7168826112';
export const BOT_ID_SERVICE_CENTER = '7853783224';
export const TELEGRAME_WEB = 'https://web.telegram.org/a';
export const T_ME_WEB = 'https://t.me';
export const TELEGRAME_WEB_P2E = `${TELEGRAME_WEB}#${P2E_ChatId}`
export const TWA_URL_PREFIX = "https://t.me/"
export const SERVER_URL = 'https://desk.web3r.site/api';
export const OPENCV_URL = 'http://192.168.43.244:3100/opencv.js?v=1';
export const WS_URL = 'ws://192.168.43.244:6788/api';

export const DISCOVER_API = "https://api-explorer.web3r.site/api"
export const DISCOVER_HOST = 'https://explorer.web3r.site/';

// export const DISCOVER_HOST_DEV = 'http://192.168.43.244:3174/';
export const DISCOVER_HOST_DEV = 'http://127.0.0.1:3174/';
export const DEFAULT_THRESHOLD = -100
export const IS_DEV =
    location.href.indexOf('192.168') > 0 || location.href.indexOf('localhost') > 0;
export const START_URL ="about:blank"
export const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0';

export const GLOBAL_CSS = `
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;
  -webkit-overflow-scrolling: touch; /* Fix for iOS smooth scrolling */
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 0.375rem; /* Rounded scrollbar */
  box-shadow: 0 0 1px rgba(255, 255, 255, 0.01);
}

`;
export const DISCOVER_PID = "DISCOVER_APPS"
export const DEVICE_PID = "DEVICE"
export const HeaderHeight = 58;
export const HomHeaderHeight = 44;
export const SiderBarWidth = 54;
export const AsideWidth = 360;
export const FEATUR_STUDIO_RIGHT_WIDTH = 280;
export const WIN_TITLE_BAR_WIDTH = 0;
export const MAC_TITLE_BAR_WIDTH = 88;
export const PLAYGROUND_WEBVIEW_WIDTH = 360;
export const PLAYGROUND_RIGHT_SIDE_WIDTH = 280;
export const PLAYGROUND_WEBVIEW_HEIGHT = 720;
export const PLAYGROUND_DEVICE_MONITOR_HEIGHT = 800;
export const PLAYGROUND_WIN_HEIGHT = 772;
export const PLAYGROUND_WEBVIEW_TOP_BAR_HEIGHT = 44;
export const WEBVIEW_BORDERRADIUS = 8;
export const BG_COLOR_ACE = "#272822";


export const ChainsList : ChainListItem[] = [
    {
        icon: 'https://wallet.tonkeeper.com/img/toncoin.svg',
        name: 'TON',
        chain: CHAIN.TON,
    },
    {
        icon: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400',
        name: 'BTC',
        chain: CHAIN.BTC,
    },
    {
        icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628',
        name: 'ETH',
        chain: CHAIN.ETH,
    },
    {
        icon: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970',
        name: 'BNB',
        chain: CHAIN.BNB,
    },
    {
        icon: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png?1718769756',
        name: 'SOL',
        chain: CHAIN.SOL,
    },
    {
        icon: 'https://assets.coingecko.com/coins/images/26375/standard/sui-ocean-square.png?1727791290',
        name: 'SUI',
        chain: CHAIN.SUI,
    }
]
export const LeftSideActions : MainNavListItem[] = [
    {
        icon: 'BubbleChart',
        name: 'Market',
        url: 'https://www.coingecko.com/',
        tabId: MAIN_NAV_TYPE.MARKET,
        side: true
    }
]

export const MainNavList : MainNavListItem[] = [
    {
        name: 'Games',
        tabId: MAIN_NAV_TYPE.GAME_FI,
        icon: 'SportsEsports',
        side: false
    },
    {
        name: 'aside_discover',
        tabId: MAIN_NAV_TYPE.DISCOVERY,
        icon: 'Explore',
        side: false
    },
    {
        name: 'wallet_title',
        tabId: MAIN_NAV_TYPE.WALLET,
        icon: 'AccountBalanceWallet',
    },
    {
        name: 'Favor',
        tabId: MAIN_NAV_TYPE.FAVOR,
        icon: 'Folder',
        side: false
    },
    {
        name: 'Favor',
        tabId: MAIN_NAV_TYPE.FAVOR,
        icon: 'Folder',
        side: false
    },
    {
        name: 'wallet_multi_send',
        tabId: MAIN_NAV_TYPE.MULTI_SEND,
        icon: 'ShareTwoTone'
    },
    {
        name: 'BrowserHistory',
        tabId: MAIN_NAV_TYPE.BROWSER_HISTORY,
        icon: 'History'
    },
    {
        name: 'apps_connect',
        tabId: MAIN_NAV_TYPE.CONNECTED_APPS,
        icon: 'Link'
    },
    {
        name: 'AccountsManage',
        tabId: MAIN_NAV_TYPE.ACCOUNTS_MANAGE,
        icon: 'Style'
    },

    {
        name: 'Dev',
        tabId: MAIN_NAV_TYPE.DEV,
        icon: 'BugReport'
    },

    {
        name: 'aside_settings',
        tabId: MAIN_NAV_TYPE.SETTING,
        icon: 'Settings'
    },

    {
        name: 'MobileDevice',
        tabId: MAIN_NAV_TYPE.MOBILE_MONITORS,
        icon: 'Devices',
        side: true
    },
];


export const ProPlans: ProPlan[] = [
    {
        level: "LONG",
        name: '永久至尊',
        description: `提供 {accountTitle} 下的不限钱包帐号的无限制无期限使用功能;一对一,7*24小时技术支持;优先获取空投;奖励积分翻倍`,
        amount: '19999'
    },
    {
        level: "YEAR",
        name: '年付会员',
        description: `提供 {walletTitle} 下无限制功能,使用期限一年。优先获取空投，工单技术支持`,
        amount: '999'
    },
];

export const DropDownMenuSx = {
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        width: 10,
        height: 10,
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0,
        top: 0,
        left: 60
    }
};

export const ENTRY_ID_ROI = "#100"
export const MARK_ID_ROI = "#1"
export const TASK_ID_ROI = "#2"
export const ALL_ID_ROI = ""
export const NOT_SHOW_IDS_ROI = [ALL_ID_ROI,MARK_ID_ROI,TASK_ID_ROI,ENTRY_ID_ROI]
export const DEFAULT_CUT_AREA = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
}