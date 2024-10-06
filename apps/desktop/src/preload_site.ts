// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron');
console.log('preload site init!');

contextBridge.exposeInMainWorld('__appApi', {
    message: (message: { action: string; payload: never }) =>
        ipcRenderer.invoke('siteMessage', message)
});

function sendMessageToMain(
    action: 'onTgWebLogged' | 'onTgWebLogout' | 'onTgWebIframe',
    payload: never
) {
    ipcRenderer.invoke('siteMessage', { action, payload });
}

let TcRootObserved = false;

function observeTcRoot() {
    if (TcRootObserved) {
        return;
    }
    TcRootObserved = true;
    const tcRoot = document.querySelector('#tc-widget-root');
    //console.debug('observeTcRoot');
    new MutationObserver((mutationsList: never[]) => {
        for (const mutation of mutationsList) {
            const button = document.querySelector(
                '#tc-widget-root button[lefticon="true"][righticon="true"]'
            );
            if (mutation.type === 'childList' && button) {
                //console.debug('observeTcRoot', mutation.type, button);
                if (button.style.display !== 'none') {
                    button.style.display = 'none';
                }

                const liList = document.querySelectorAll(
                    '#tc-widget-root button[data-tc-wallet-item="true"]'
                );
                if (liList.length > 1) {
                    const parent = liList[0].parentElement.parentElement;
                    let i = 0;
                    for (const child of parent.children) {
                        if (i === 0) {
                            child.style.display = 'flex';
                            child.style.width = '100%';
                            child.style.alignItems = child.style.justifyContent = 'center';
                        } else {
                            parent.removeChild(child); // Remove the child element
                        }
                        i += 1;
                    }
                }
            }
        }
    }).observe(tcRoot, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });
}

let PortalsObserved = false;

function observePortals() {
    if (PortalsObserved) {
        return;
    }
    PortalsObserved = true;
    const portals = document.querySelector('#portals');
    //console.debug('observePortals');
    new MutationObserver((mutationsList: never[]) => {
        for (const mutation of mutationsList) {
            //console.debug('observePortals', mutation.type);
            if (mutation.type === 'childList') {
                const iframe = portals.querySelector('iframe');
                if (iframe && iframe.src && iframe.src !== 'about:blank') {
                    //console.debug(iframe.src);
                    sendMessageToMain('onTgWebIframe', { url: iframe.src });
                    //iframe.src = 'about:blank';
                }
            }
        }
    }).observe(portals, {
        childList: true,
        subtree: true
    });
}

let tgLogged = false;

function observeTgWebSite() {
    const user_auth = JSON.parse(localStorage.getItem('user_auth') || '{}');
    //console.log(user_auth);
    if (user_auth.dcID) {
        if (!tgLogged) {
            const userId = user_auth.id;
            sendMessageToMain('onTgWebLogged', { userId });
            tgLogged = true;
        }

        const portals = document.querySelector('#portals');
        if (portals) {
            observePortals();
        }
    } else {
        if (tgLogged) {
            sendMessageToMain('onTgWebLogout');
            tgLogged = false;
        }
    }
}

function observeBody() {
    console.debug('observeBody');
    new MutationObserver((mutationsList: any[]) => {
        for (const mutation of mutationsList) {
            console.debug('observeBody', mutation.type);
            if (mutation.type === 'childList') {
                const tcRoot = document.querySelector('#tc-widget-root');
                if (tcRoot) {
                    observeTcRoot();
                }
                if (location.hostname.indexOf('web.telegram') > -1) {
                    observeTgWebSite();
                }
            }
        }
    }).observe(document.body, {
        childList: true,
        subtree: true
    });
}

const callback = (message: { action: string; payload: never }) => {
    console.log('render callback', message);
};

document.addEventListener(
    'DOMContentLoaded',
    () => {
        ipcRenderer.on('render', (_event: never, message: { action: string; payload: never }) =>
            callback(message)
        );
        observeBody();
    },
    false
);
