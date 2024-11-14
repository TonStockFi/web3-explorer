import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppKey } from '@tonkeeper/core/dist/Keys';
import { IStorage } from '@tonkeeper/core/dist/Storage';
import { DeprecatedAccountState } from '@tonkeeper/core/dist/entries/account';
import { Language, localizationText } from '@tonkeeper/core/dist/entries/language';
import { DeprecatedWalletState } from '@tonkeeper/core/dist/entries/wallet';
import { useAppSdk } from '../hooks/appSdk';
import { useTranslation } from '../hooks/translation';
import { QueryKey } from '../libs/queryKey';

export const useUserLanguage = () => {
    const sdk = useAppSdk();
    return useQuery<Language>(
        [QueryKey.language],
        async () => {
            let lang = await sdk.storage.get<Language | undefined>(AppKey.LANGUAGE);

            if (!lang) {
                lang = await migrateLanguage(sdk.storage);
            }

            if (!lang || !Object.values(Language).includes(lang)) {
                return Language.EN;
            }

            return lang;
        },
        {
            keepPreviousData: true
        }
    );
};

async function migrateLanguage(storage: IStorage): Promise<Language | undefined> {
    const state = await storage.get<DeprecatedAccountState>(AppKey.DEPRECATED_ACCOUNT);

    if (!state || !state.activePublicKey) {
        return;
    }

    const wallet = await storage.get<DeprecatedWalletState>(
        `${AppKey.DEPRECATED_WALLET}_${state.activePublicKey}`
    );
    return wallet?.lang;
}

export const useMutateUserLanguage = () => {
    const { i18n } = useTranslation();

    const sdk = useAppSdk();
    const client = useQueryClient();
    return useMutation<void, Error, Language>(async lang => {
        await i18n.reloadResources([localizationText(lang)]);
        await i18n.changeLanguage(localizationText(lang));

        await sdk.storage.set(AppKey.LANGUAGE, lang);
        await client.invalidateQueries([QueryKey.language]);
    });
};
