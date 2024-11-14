import { sendMessageToMain } from "./utils";
let PortalsObserved = false;
let SelectTextInjected = false;

export const tgCallback = (message: { action: string; payload: never }) => {
    console.debug('render callback', message);
    // switch (message.action){
    //     case "tgLogged":
    //         loading_getTgGlobalState = false
    //         tgLogged = true;

    //         break;
    //     case "tgLogout":
    //         localStorage.removeItem('user_auth')
    //         localStorage.clear()
    //         location.reload();
    //         tgCallback(message)
    //         break;
    //     default:
    //         break;
    // }
};
let __text = ""

function handleSelectText(){
    if(SelectTextInjected){
        return;
    }
    SelectTextInjected = true;
    setInterval(()=>{
        if(__text){
            sendMessageToMain('onTgSiteSelectText', { text:__text});
            __text = ""
        }
    },800)

    document.addEventListener("mouseup",(e)=>{
        const selection = window.getSelection();
        const text = selection.toString();
        if(text.trim()){
            __text = text.trim();
            setTimeout(()=>selection.removeAllRanges(),3000)
        }
    }) 
}
export function observePortals() {
    if (PortalsObserved) {
        return;
    }
    setInterval(()=>{
        if(__text){
            sendMessageToMain('onTgSiteSelectText', { text:__text});
            __text = ""
        }
    },800)

    document.addEventListener("mouseup",(e)=>{
        const selection = window.getSelection();
        const text = selection.toString();
        if(text.trim()){
            __text = text.trim();
            setTimeout(()=>selection.removeAllRanges(),3000)
        }
    })  

    // PortalsObserved = true;
    // console.debug('observePortals');
    // const portals = document.querySelector('#portals');

    // new MutationObserver((mutationsList: any[]) => {
    //     for (const mutation of mutationsList) {
    //         console.debug('observePortals', mutation.type);
    //         if (mutation.type === 'childList') {
    //             const portals = document.querySelector('#portals');
    //             const iframe = portals.querySelector('iframe');
    //             console.debug('observePortals', iframe);
    //             if (iframe && iframe.src && iframe.src !== 'about:blank') {
    //                 sendMessageToMain('onTgWebIframe', { url: iframe.src });
    //             }
    //             const button1 = document.querySelector(".join-subscribe-button");
    //             if(button1){
    //                 const rect = button1.getBoundingClientRect();
    //                 sendMessageToMain('onTgWebJoinButton', {top:rect.top,left:rect.left,width:rect.width,height:rect.height});
    //             }
    //             const button = document.querySelector("#portals .confirm-dialog-button");
    //             if(button){
    //                 sendMessageToMain('onTgWebIframeConfirm', {});
    //             }
                
    //         }
    //     }
    // }).observe(portals, {
    //     childList: true,
    //     subtree: true
    // });
}

// let tgLogged = false;

// async function getTgGlobalState() {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open('tt-data', 1);
//         request.onsuccess = (event) => {
//             const db = request.result;
//             const transaction = db.transaction(['store'], 'readonly');
//             const objectStore = transaction.objectStore('store');
//             const getRequest = objectStore.get('tt-global-state');
//             getRequest.onsuccess = (event:any) => {
//                 resolve(event.target.result);
//             };
//             getRequest.onerror = (event) => {
//                 reject('Error retrieving data from IndexedDB');
//             };
//         };
//         request.onerror = (event) => {
//             reject('Error opening IndexedDB');
//         };
//     });
// }
// let loading_getTgGlobalState = false;

export function observeTgWebSite() {
    handleSelectText()
    // const user_auth = JSON.parse(localStorage.getItem('user_auth') || '{}');
    // console.debug("tgLogged:",{tgLogged,PortalsObserved},user_auth);
    // if (user_auth.dcID && user_auth.id) {
    //     if (!tgLogged) {
    //         if(loading_getTgGlobalState){
    //             return
    //         }
    //         loading_getTgGlobalState = true;
    //         getTgGlobalState().then((state:any)=>{
    //             if(state && state.users && state.users.byId && state.users.byId[user_auth.id]){
    //                 const user = state.users.byId[user_auth.id];
    //                 sendMessageToMain('onTgWebLogged', { user });
    //             }else{
    //                 loading_getTgGlobalState = false
    //             }
    //         }).catch(e=>{
    //             loading_getTgGlobalState = false
    //         })
    //     }

    //     const portals = document.querySelector('#portals');
    //     if (portals) {
    //         observePortals();
    //     }else{
    //         PortalsObserved = false
    //     }
    // } else {
    //     if (tgLogged) {
    //         sendMessageToMain('onTgWebLogout');
    //         tgLogged = false;
    //     }
    // }
}

export function observeTMEWebSite() {
    if (location.hostname.indexOf('t.me') === -1) {
        return;
    }

}