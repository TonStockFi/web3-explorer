export const SERVER_URL = 'https://desk.web3r.site/api';
export const OPENCV_URL = 'http://192.168.43.244:3100/opencv.js?v=1';
export const WS_URL = 'ws://192.168.43.244:3204/api';

export const IS_DEV =
    location.href.indexOf('192.168') > 0 || location.href.indexOf('localhost') > 0;

export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0';


export const GLOBAL_CSS = `
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;
  -webkit-overflow-scrolling: touch; /* Fix for iOS smooth scrolling */
  pointer-events: auto; /* Ensure pointer events work properly */
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
