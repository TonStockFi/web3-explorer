import { SiteInfo } from '../types';

export const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0';

export const GLOBAL_JS_TG = `
  function observeIframe(iframe) {
    if (!iframe) return;
    const url = iframe.src
    if(url && url !== "about:blank"){
        iframe.src="about:blank"
        iframe.display = "none"
        localStorage.setItem("webview_url",url)
    }
  }

  function observeportals(portals) {
    if (!portals) return;
    const iframe = portals.querySelector('iframe');
    
    if (iframe) {
      observeIframe(iframe);
    }
    const portalsObserver = new MutationObserver(() => {
      const newIframe = portals.querySelector('iframe');
      if (newIframe) {
        observeIframe(newIframe);
      }
    });

    portalsObserver.observe(portals, {
      childList: true,
      subtree: true
    });
  }

  const bodyObserver = new MutationObserver(() => {
    const portals = document.getElementById('portals');
    if (portals) {
      observeportals(portals);
    }
  });

  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('Body observer attached.');

`;
export const GLOBAL_JS = `
// document.addEventListener('mousedown', ({pageX,pageY}) => {
//     console.log('Mouse Down:', {pageX,pageY});
// });
// document.addEventListener('mouseup', ({pageX,pageY}) => {
//     console.log('Mouse Up:', {pageX,pageY});
// });
`;
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
