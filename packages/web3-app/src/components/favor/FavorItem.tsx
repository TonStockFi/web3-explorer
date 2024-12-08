import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import { useBrowserContext } from '../../providers/BrowserProvider';

import { currentTs } from '../../common/utils';
import { DEFAULT_FOLDER } from '../../providers/FavorProvider';
import { BrowserFavorProps } from '../../services/BrowserFavorService';
import DropDownIconButton, { DropDownIconButtonItem } from '../DropDownIconButton';
import { SiteFavoricoView } from '../app/SiteFavoricoView';

export function FavorItem({
    currentFolder,
    itemOptions,
    favor,
    searchVal,
    folderIds
}: {
    itemOptions: DropDownIconButtonItem[];
    folderIds: string[];
    currentFolder: string;
    searchVal: string;
    favor: BrowserFavorProps;
}) {
    const { newTab, theme, updateAt } = useBrowserContext();
    const { id, folder } = favor;

    const [loaded, setLoaded] = useState<boolean>(true);

    if (folder) {
        if (folderIds.indexOf(folder) === -1 && currentFolder !== DEFAULT_FOLDER) {
            return null;
        }
        if (folderIds.indexOf(folder) > -1 && currentFolder !== folder) {
            return null;
        }
    }

    if (!folder && currentFolder !== DEFAULT_FOLDER) {
        return null;
    }

    return (
        <View
            jSpaceBetween
            aStart
            borderBox
            aCenter
            px={12}
            w={280}
            h={64}
            mb={4}
            mr12
            sx={{ border: `1px solid ${theme.separatorCommon}` }}
            borderRadius={8}
            hoverBgColor={theme.backgroundContentTint}
        >
            <View
                h100p
                pointer
                row
                jStart
                aCenter
                hide={!loaded}
                flex1
                onClick={() => {
                    const ts = currentTs();
                    newTab({
                        tabId: `tab1_${ts}`,
                        ts,
                        url: favor.url,
                        name: favor.title
                    });
                }}
            >
                <View wh={40} center>
                    <SiteFavoricoView size={36} url={favor.url} title={favor.title} />
                </View>
                <View flex1 w={'100px'}>
                    <View
                        w100p
                        h={24}
                        textProps={{
                            sx: {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxHeight: 24,
                                width: '100%',
                                whiteSpace: 'nowrap'
                            }
                        }}
                        text={favor?.title || ''}
                    />
                </View>
            </View>
            <View rowVCenter jStart hide={loaded}>
                <View mr12 skeletonCircular skeletonProps={{ width: 32, height: 32 }} />
                <View skeletonText w={100} sx={{ fontSize: '1rem' }} />
            </View>
            <View rowVCenter jStart>
                <DropDownIconButton small id={id} items={itemOptions} />
            </View>
        </View>
    );
}
