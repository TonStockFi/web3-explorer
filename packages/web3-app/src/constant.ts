import { MAIN_NAV_TYPE, ProPlan } from './types';
export const PRO_RECV_ADDRESS="UQAonoXuQ_1WzZhwbuoIHYFwBqkVCmZSf-yr0DQ1uhnIz53g"
export const P2E_ChatId = '7363481027';
export const TELEGRAME_WEB = 'https://web.telegram.org/a';
export const TELEGRAME_WEB_P2E = `${TELEGRAME_WEB}#${P2E_ChatId}`
export const TWA_URL_PREFIX = "https://t.me/"
export const SERVER_URL = 'https://desk.web3r.site/api';
export const OPENCV_URL = 'http://192.168.43.244:3100/opencv.js?v=1';
export const WS_URL = 'ws://192.168.43.244:6788/api';

export const DISCOVER_HOST = 'https://explorer.web3r.site/';

export const DISCOVER_HOST_DEV = 'http://192.168.43.244:3174/';
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
export const HeaderHeight = 58;
export const HomHeaderHeight = 44;
export const SiderBarWidth = 54;
export const AsideWidth = 360;

export const WIN_TITLE_BAR_WIDTH = 0;
export const MAC_TITLE_BAR_WIDTH = 88;
export const PLAYGROUND_WEBVIEW_WIDTH = 360;
export const PLAYGROUND_RIGHT_SIDE_WIDTH = 380;
export const PLAYGROUND_WEBVIEW_HEIGHT = 720;
export const PLAYGROUND_WEBVIEW_TOP_BAR_HEIGHT = 44;
export const WEBVIEW_BORDERRADIUS = 8;

export const MainNavList = [
    {
        name: 'ChatGpt',
        tabId: MAIN_NAV_TYPE.CHATGPT,
        icon: 'icon_chatgpt',
        // side: true
    },
    {
        name: 'Gemini',
        tabId: MAIN_NAV_TYPE.GENIMI,
        icon: 'icon_gemini',
        // side: true
    },
    {
        name: 'wallet_title',
        tabId: MAIN_NAV_TYPE.WALLET,
        icon: 'AccountBalanceWallet',
        side: true
    },
    {
        name: '资产分析',
        tabId: MAIN_NAV_TYPE.DASHBOARD,
        icon: 'Insights',
        side: true
    },
    {
        icon: 'BubbleChart',
        name: 'Market',
        tabId: MAIN_NAV_TYPE.MARKET,
        side: true
    },
    {
        name: 'Games',
        tabId: MAIN_NAV_TYPE.GAME_FI,
        icon: 'SportsEsports',
        side: true
    },
    
    {
        name: 'Favor',
        tabId: MAIN_NAV_TYPE.FAVOR,
        icon: 'Folder',
        side: true
    },

    {
        name: 'aside_discover',
        tabId: MAIN_NAV_TYPE.DISCOVERY,
        icon: 'Explore'
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
    }
];


export const ProPlans: ProPlan[] = [
    {
        level: "LONG",
        name: '永久至尊',
        description: `提供 {accountTitle} 下的n个钱包帐号的无限制无期限使用功能。包括不限于:一对多转帐、超级智能机器识别辅助`,
        amount: '99990000000'
    },
    {
        level: "YEAR",
        name: '年付',
        description: `提供 {walletTitle} 无限制功能,使用期限一年。包括不限于:一对多转帐、超级智能机器识别辅助`,
        amount: '9999000000'
    },
    {
        level: "MONTH",
        name: '月付',
        description: `提供 {walletTitle} 无限制功能,使用期限一个月。包括不限于:一对多转帐、超级智能机器识别辅助`,
        amount: '9990000'
    },
];