import { sendMessageToMain } from "./utils"

function getBalance(){
    const balancePanel = document.querySelector(".i2p6rn6")
    if(balancePanel){
        const textContent = balancePanel.textContent
        if(textContent.indexOf("Balance") && textContent.indexOf("Tokens")){
            const res = textContent.substring(textContent.indexOf("Balance") + "Balance".length,textContent.indexOf("Tokens"))
            const [ton,usdBalance] = res.split(" TON≈ $")
            console.log("balance",{ton,usdBalance})
            sendMessageToMain('CurrentAccountBalance', {ton,usdBalance});
        }
    }
}
function parseHtmlToJson(element:any) {
    if (!element) {
      return null;
    }
    const {href} = element
    const symbolEle = element.querySelector(".amount")
    const symbol = symbolEle.textContent.trim()
    const data = {
        url:href,
        icon: element.children[0].querySelector("img").src,
        symbol,
        quantity:symbolEle.parentElement.textContent.replace(symbol,"")
    };
  
    return data;
  }
export function tonViewer() {

    if (location.hostname.indexOf('tonviewer.com') === -1) {
        return;
    }
    getBalance();

    const amountElements = document.querySelectorAll(".amount");
    const jettons:any[] = []
    if(amountElements.length > 0){
        const parentElement = amountElements[0].parentElement.parentElement.parentElement.parentElement
        for (let index = 0; index < parentElement.children.length; index++) {
            const child = parentElement.children[index];
            const jsonData = parseHtmlToJson(child.querySelector("a"));
            jettons.push(jsonData)
        }
        
    }
    console.log({jettons})
    sendMessageToMain('CurrentAccountJettons', {jettons});
}

