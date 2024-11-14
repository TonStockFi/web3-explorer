import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import { View } from '@web3-explorer/uikit-view';
import { useEffect, useState } from 'react';
import EditFavor from '../../components/favor/EditFavor';
import { FavorItem } from '../../components/favor/FavorItem';
import { FolderSideView } from '../../components/favor/FolderSideView';
import { Page } from '../../components/Page';
import { useBrowserContext } from '../../providers/BrowserProvider';
import { DEFAULT_FOLDER, useFavorContext } from '../../providers/FavorProvider';
import { useIAppContext } from '../../providers/IAppProvider';
import BrowserFavorService, { BrowserFavorProps } from '../../services/BrowserFavorService';

export function BrowserFavorPage() {
    const { favors, setFolders, folders, removeFavor, saveFavor } = useFavorContext();

    const [rows, setRows] = useState<BrowserFavorProps[]>([]);

    useEffect(() => {
        BrowserFavorService.getAll().then(rows => {
            rows.sort((a, b) => b.ts - a.ts);
            rows.forEach(row => {
                saveFavor(row, true);
            });
            setRows(rows);
        });
    }, []);
    const [searchVal, setSearchVal] = useState('');
    const { showSnackbar } = useIAppContext();
    const [selectedFolder, setSelectedFolder] = useState(DEFAULT_FOLDER);
    const [showAddFolder, setShowAddFolder] = useState(false);

    const [cancelFavorId, setCancelFavorId] = useState('');
    const [editFavorId, setEditFavorId] = useState('');
    const [moveToFolderFavorId, setMoveToFolderFavorId] = useState('');
    const { t, theme, updateAt } = useBrowserContext();
    const [showSearchIcon, setShowSearchIcon] = useState(true);
    const itemOptions = [
        {
            text: t('EditFavor'),
            icon: 'Edit',
            onClick: (id: string) => {
                setEditFavorId(id);
            }
        },
        {
            text: t('CancelFavor'),
            icon: 'Delete',
            onClick: (id: string) => {
                setCancelFavorId(id);
            }
        },
        {
            text: t('MoveTo'),
            icon: 'MoveDown',
            onClick: (id: string) => {
                setMoveToFolderFavorId(id);
            }
        }
    ];

    console.log({ rows });
    return (
        <Page
            header={
                <View flex1 row jSpaceBetween aCenter>
                    <View hide flex1 aCenter borderBox px={24}>
                        <TextField
                            autoFocus
                            value={searchVal}
                            onBlur={() => setShowSearchIcon(true)}
                            onChange={e => {
                                setSearchVal(e.target.value);
                            }}
                            placeholder={t('SearchBrowserFavor')}
                            size="small"
                            sx={{ width: `100%` }}
                            slotProps={{
                                input: {
                                    startAdornment: <View icon="Search" />,
                                    sx: {
                                        borderRadius: '14px',
                                        '& .MuiInputBase-input ': {
                                            py: '7px',
                                            fontSize: '1rem'
                                        }
                                    },
                                    type: 'search'
                                }
                            }}
                        />
                    </View>
                    <View flex1 w100p rowVCenter jEnd>
                        <View
                            hide
                            mr12
                            icon="Search"
                            onClick={() => setShowSearchIcon(false)}
                            iconButtonSmall
                        />
                    </View>
                    <View aCenter>
                        <View
                            buttonStartIcon={<View icon="Add" />}
                            onClick={() => setShowAddFolder(true)}
                            buttonVariant="outlined"
                            button={t('AddFolder')}
                        />
                    </View>
                </View>
            }
        >
            <View row wh100p>
                <FolderSideView
                    setSelectedFolder={(v: string) => setSelectedFolder(v)}
                    selectedFolder={selectedFolder}
                />
                <View flex1>
                    <View wh100p overflowYAuto>
                        <View row pt12 px={12} w100p borderBox fWrap>
                            {rows.map(favor => {
                                return (
                                    <FavorItem
                                        key={favor.id}
                                        folderIds={folders.map(folder => folder.name)}
                                        currentFolder={selectedFolder}
                                        searchVal={searchVal}
                                        favor={favor}
                                        itemOptions={itemOptions}
                                    />
                                );
                            })}
                        </View>
                    </View>
                </View>
                <View
                    prompt={{
                        title: t('AddFolder'),
                        open: showAddFolder,
                        onConfirm: async (v: string) => {
                            if (folders.find(row => row.name === v)) {
                                showSnackbar({ message: t('FolderExists') });
                                return false;
                            }
                            setFolders([...folders, { name: v }]);

                            setSelectedFolder(v);
                            setShowAddFolder(false);
                            return true;
                        },
                        onClose: () => setShowAddFolder(false)
                    }}
                />

                <View
                    confirm={{
                        id: 'cancelFavorId',
                        title: t('CancelFavor'),
                        open: !!cancelFavorId,
                        content: t('confirm_delete'),
                        onCancel: () => {
                            setCancelFavorId('');
                        },
                        onConfirm: () => {
                            removeFavor(cancelFavorId);
                            setRows(rows.filter(row => row.id !== cancelFavorId));
                            setCancelFavorId('');
                        }
                    }}
                />
                <View
                    dialog={{
                        content: (
                            <View borderBox wh100p column h100p bgColor={theme.backgroundPage}>
                                <View h={48} px={12} abs top0 left0 right0 rowVCenter jSpaceBetween>
                                    <View rowVCenter text={t('MoveTo')} pl12 />
                                    <View
                                        iconSmall
                                        icon={'Close'}
                                        iconButtonSmall
                                        onClick={() => setMoveToFolderFavorId('')}
                                    />
                                </View>
                                <View overflowYAuto pt={48} px={12}>
                                    <View list borderRadius={8}>
                                        {folders
                                            .filter(folder => folder.name !== DEFAULT_FOLDER)
                                            .map(folder => {
                                                return (
                                                    <View
                                                        onClick={() => {
                                                            setRows(
                                                                rows.map(row => {
                                                                    console.log(
                                                                        row,
                                                                        moveToFolderFavorId
                                                                    );
                                                                    return row.id ===
                                                                        moveToFolderFavorId
                                                                        ? {
                                                                              ...row,
                                                                              folder: folder.name
                                                                          }
                                                                        : row;
                                                                })
                                                            );
                                                            const favor =
                                                                favors.get(moveToFolderFavorId);
                                                            saveFavor({
                                                                ...favor!,
                                                                folder: folder.name
                                                            });
                                                            setMoveToFolderFavorId('');
                                                        }}
                                                        listItemIcon={<View icon={'Folder'} />}
                                                        listItemText={
                                                            folder.name === DEFAULT_FOLDER
                                                                ? t(DEFAULT_FOLDER)
                                                                : folder.name
                                                        }
                                                        key={folder.name}
                                                    />
                                                );
                                            })}
                                    </View>
                                </View>
                            </View>
                        ),
                        dialogProps: {
                            sx: {
                                '& .MuiDialog-paper': { width: 360, height: 500 }
                            },
                            onClose: () => setMoveToFolderFavorId(''),
                            open: !!moveToFolderFavorId
                        }
                    }}
                />
            </View>
            <EditFavor
                onConfirm={(f: BrowserFavorProps) => {
                    setRows(
                        rows.map(row => {
                            return row.id === editFavorId ? f : row;
                        })
                    );
                    setEditFavorId('');
                }}
                id={editFavorId}
                onClose={() => setEditFavorId('')}
            ></EditFavor>
        </Page>
    );
}
