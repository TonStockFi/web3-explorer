import resources from '@tonkeeper/locales/dist/i18n/resources.json';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
let i18nextLng = localStorage.getItem("i18nextLng") 
const {searchParams}= new URL(location.href)
let lang = searchParams.get("lang")
if(!lang){
  lang = i18nextLng;
}else{
  localStorage.setItem("i18nextLng",lang);
}
i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    debug: false,
    lng: lang || 'zh_CN', // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
    fallbackLng: lang ||'zh_CN',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
