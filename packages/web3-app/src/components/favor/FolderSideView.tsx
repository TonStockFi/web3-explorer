import { View } from '@web3-explorer/uikit-view';
import { useState } from 'react';
import DropDownIconButton from '../../components/DropDownIconButton';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { DEFAULT_FOLDER, useFavorContext } from '../../providers/FavorProvider';
import { useIAppContext } from '../../providers/IAppProvider';

export function FolderSideView({
    selectedFolder,
    setSelectedFolder
}: {
    setSelectedFolder: (v: string) => void;
    selectedFolder: string;
}) {
    const { folders, setFolders } = useFavorContext();

    const { showConfirm } = useIAppContext();
    const { t, theme, updateAt } = useBrowserContext();
    const [renameFolderId, setRenameFolderId] = useState('');
    const folderOptions = [
        {
            text: t('Rename'),
            icon: 'Edit',
            onClick: (id: string) => {
                setRenameFolderId(id);
            }
        },
        {
            text: t('DeleteFolder'),
            icon: 'Delete',
            onClick: (id: string) => {
                showConfirm({
                    id: 'deleteFolderId',
                    title: 'DeleteFolder',
                    content: 'confirm_delete',
                    onConfirm: () => {
                        setFolders(folders.filter(folder => folder.name !== id));
                        setSelectedFolder(DEFAULT_FOLDER);
                        showConfirm(false);
                    },
                    onCancel: () => {
                        showConfirm(false);
                    }
                });
            }
        }
    ];
    return (
        <View w={280} pr={8} mr={8} sx={{ borderRight: `1px solid ${theme.separatorCommon}` }}>
            <View pb={16} px={12} borderRadius={8}>
                <View list borderRadius={8}>
                    {folders.map(folder => {
                        const isSelected = selectedFolder === folder.name;
                        return (
                            <View key={folder.name} rowVCenter>
                                <View wh={24} mr={4} center>
                                    {folder.name === DEFAULT_FOLDER ? undefined : (
                                        <DropDownIconButton
                                            small
                                            id={folder.name}
                                            items={folderOptions}
                                        />
                                    )}
                                </View>
                                <View
                                    flex1
                                    onClick={e => {
                                        console.log(e);
                                        setSelectedFolder(folder.name);
                                    }}
                                    listSelected={isSelected}
                                    listItemIcon={
                                        <View icon={!isSelected ? 'Folder' : 'FolderOpen'} />
                                    }
                                    listItemText={
                                        folder.name === DEFAULT_FOLDER
                                            ? t(DEFAULT_FOLDER)
                                            : folder.name
                                    }
                                />
                            </View>
                        );
                    })}
                </View>
            </View>
            <View
                prompt={{
                    title: t('Rename'),
                    open: !!renameFolderId,
                    onConfirm: async (v: string) => {
                        setFolders(
                            folders.map(folder => {
                                if (folder.name === renameFolderId) {
                                    return {
                                        ...folder,
                                        name: v
                                    };
                                } else {
                                    return folder;
                                }
                            })
                        );
                        setRenameFolderId('');
                        return true;
                    },
                    onClose: () => setRenameFolderId('')
                }}
            />
        </View>
    );
}
