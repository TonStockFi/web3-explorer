import * as React from 'react';
import { useState } from 'react';
import Card from '@web3-explorer/uikit-mui/dist/mui/Card';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';
import IconButton from '@web3-explorer/uikit-mui/dist/mui/IconButton';
import TextField from '@web3-explorer/uikit-mui/dist/mui/TextField';
import Tooltip from '@web3-explorer/uikit-mui/dist/mui/Tooltip';

import { DeviceOptions, ScreenInfo, XYWHProps } from '../types';
import { View } from '@web3-explorer/uikit-view';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import { matchSimpleTemplate } from '../../../common/opencv';
import { DefaultCutRect, getMonitorImageId, getRoiRect } from '../global';
import { sendClick, wsSendClientClickEvent } from '../../../common/ws';
import CutAreaService from '../../../common/CutAreaService';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

export default function CutAreaItemView({
    imageUrl,
    setImageUrl,
    id,
    getAreas,
    roiXYWH,
    monitorScale,
    screen,
    name,
    compressQuality,
    deviceOptions,
    setMatchThreshold,
    matchThreshold,
    areaList,
    setAreaList,
    ts
}: {
    getAreas?: any;
    matchThreshold: number;
    deviceOptions: DeviceOptions;
    id?: string;
    name?: string;
    setMatchThreshold?: any;
    imageUrl: string;
    setImageUrl?: any;
    roiXYWH: XYWHProps;
    monitorScale: number;
    screen: ScreenInfo;
    compressQuality: number;
    setAreaList?: any;
    areaList?: any[];
    ts?: number;
}) {
    const { ws, webview, deviceId } = deviceOptions;
    const [recognitionArea, setRecognitionArea] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [nameVal, setNameVal] = useState(name || '');
    const [prompt, setPrompt] = useState('');

    const inputIsOpen = deviceOptions.getDeviceInfo('inputIsOpen', false);
    const width = roiXYWH.w / monitorScale;
    const height = roiXYWH.h / monitorScale;
    const x = roiXYWH.x / monitorScale;
    const y = roiXYWH.y / monitorScale;

    const getIdFromImageUrl = (url: string) => {
        const t = url.split('/');
        return t[t.length - 1];
    };
    const onSave = async (nameVal: string) => {
        let rowId;
        let ts1;
        if (!id) {
            ts1 = +new Date();
            const { pathname } = new URL(imageUrl.replace('blob:', ''));
            rowId = pathname.substring(1);
        } else {
            ts1 = ts;
            rowId = id;
        }

        let info: any = {
            id: rowId,
            ts: ts1,
            roiXYWH,
            matchThreshold,
            monitorScale,
            screen,
            compressQuality,
            deviceId,
            name: nameVal
        };

        const cutAreaService = new CutAreaService(deviceId);

        if (!id) {
            await cutAreaService.saveArea(rowId, info, imageUrl);
            if (setAreaList && areaList) {
                setAreaList([info, ...areaList]);
            }
            setRecognitionArea([]);
            deviceOptions.setRecognitionAreaRect([]);
            deviceOptions.setCutAreaRect(DefaultCutRect);
            setImageUrl('');
        } else {
            await cutAreaService.update(rowId, info);
            await getAreas();
        }

        deviceOptions.setSnackbar('保存成功');
    };

    let hide = false;
    if (id) {
        hide = name === nameVal;
    }

    const onClose = () => {
        if (!id && setMatchThreshold) {
            setMatchThreshold(0);
        }
        setRecognitionArea([]);
        deviceOptions.setRecognitionAreaRect([]);
        deviceOptions.setCutAreaRect(DefaultCutRect);
    };
    const onMatch = () => {
        //@ts-ignore
        const { cv } = window;
        console.log({ matchThreshold });
        const res = matchSimpleTemplate(
            cv,
            getMonitorImageId(deviceOptions),
            getIdFromImageUrl(imageUrl),
            matchThreshold
        );
        if (res) {
            if (setMatchThreshold) {
                setMatchThreshold(res.maxVal);
            }
            //@ts-ignore
            setRecognitionArea([res]);
            deviceOptions.setRecognitionAreaRect([res]);
            deviceOptions.setSnackbar('匹配成功');
            setTimeout(() => {
                deviceOptions.setRecognitionAreaRect([]);
            }, 1000);
        } else {
            setRecognitionArea([]);
            deviceOptions.setRecognitionAreaRect([]);
            deviceOptions.setSnackbar('匹配失败');
        }
        deviceOptions.setCutAreaRect(DefaultCutRect);
    };
    const onClickTest = async () => {
        const xywh = getRoiRect(recognitionArea[0]);

        if (webview) {
            const x = xywh.x + xywh.w / 2;
            const y = xywh.y + xywh.h / 2;
            await sendClick(webview, x, y);
        } else {
            const x = (xywh.x + xywh.w / 2) / monitorScale;
            const y = (xywh.y + xywh.h / 2) / monitorScale;
            wsSendClientClickEvent(x, y, ws);
        }

        deviceOptions.setCutAreaRect(DefaultCutRect);
        setRecognitionArea([]);
        deviceOptions.setRecognitionAreaRect([]);
    };

    return (
        <Card sx={{ display: 'flex' }}>
            <View w100p row>
                <View
                    w={'100px'}
                    center
                    sx={{
                        height: `100%`,
                        bgcolor: `rgba(0,0,0,0.2)`
                    }}
                >
                    {imageUrl && (
                        <>
                            <img
                                style={{ maxWidth: '90%', maxHeight: '90%' }}
                                src={imageUrl}
                                alt="cut image"
                            />
                            <img
                                style={{ display: 'none' }}
                                id={getIdFromImageUrl(imageUrl)}
                                src={imageUrl}
                                width={`${roiXYWH.w}px`}
                                height={`${roiXYWH.h}px`}
                                alt="cut image"
                            />
                        </>
                    )}
                </View>
                <View pl12 sx={{ pt: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <View>
                        <View hide={!id}>
                            <TextField
                                sx={{ width: '200px' }}
                                label={name ? '名称' : '设置一个名称'}
                                variant="standard"
                                value={nameVal}
                                onChange={e => {
                                    setNameVal(e.target.value);
                                }}
                            />
                        </View>
                        <View row alignItems={'center'} sx={{ mt: 1 }}>
                            <View mr12>
                                <Typography fontSize={'12px'}>{`x: ${Math.round(
                                    x
                                )}, y: ${Math.round(y)}`}</Typography>
                            </View>
                            <View row center>
                                <Typography fontSize={'12px'}>{`w: ${Math.round(
                                    width
                                )}, h: ${Math.round(height)}`}</Typography>
                            </View>
                        </View>
                    </View>
                    <View
                        row
                        sx={{
                            mb: 1,
                            mt: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <View row>
                            <View>
                                <Tooltip placement={'bottom'} title="在屏幕中匹配">
                                    <IconButton
                                        size={'small'}
                                        onClick={() => {
                                            onMatch();
                                        }}
                                        aria-label="ImageSearch"
                                    >
                                        <ImageSearchIcon />
                                    </IconButton>
                                </Tooltip>
                            </View>

                            {recognitionArea.length > 0 && (
                                <>
                                    {inputIsOpen && (
                                        <View>
                                            <Tooltip placement={'bottom'} title="点击">
                                                <IconButton
                                                    size={'small'}
                                                    onClick={async () => {
                                                        await onClickTest();
                                                    }}
                                                    aria-label="TouchApp"
                                                >
                                                    <TouchAppIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </View>
                                    )}
                                    <View hide={hide}>
                                        <Tooltip placement={'bottom'} title="保存">
                                            <IconButton
                                                size={'small'}
                                                onClick={async () => {
                                                    if (!id) {
                                                        setPrompt('请设置一个名称');
                                                        return;
                                                    }
                                                    if (nameVal.length === 0) {
                                                        deviceOptions.setSnackbar('请设置一个名称');
                                                        return;
                                                    }
                                                    await onSave(nameVal);
                                                }}
                                                aria-label="LibraryAdd"
                                            >
                                                {id ? <SaveIcon /> : <LibraryAddIcon />}
                                            </IconButton>
                                        </Tooltip>
                                    </View>
                                    {/*<View>*/}
                                    {/*    <Tooltip placement={'bottom'} title="关闭">*/}
                                    {/*        <IconButton*/}
                                    {/*            size={'small'}*/}
                                    {/*            onClick={() => {*/}
                                    {/*                onClose();*/}
                                    {/*            }}*/}
                                    {/*            aria-label="Clear"*/}
                                    {/*        >*/}
                                    {/*            <ClearIcon />*/}
                                    {/*        </IconButton>*/}
                                    {/*    </Tooltip>*/}
                                    {/*</View>*/}
                                </>
                            )}
                        </View>

                        <View hide={!id} mr12 row sx={{ justifyContent: 'flex-end' }}>
                            <View mr12 hide={hide}>
                                <Tooltip placement={'bottom'} title="保存">
                                    <IconButton
                                        size={'small'}
                                        onClick={async () => {
                                            if (!id) {
                                                setPrompt('请设置一个名称');
                                                return;
                                            }
                                            if (nameVal.length === 0) {
                                                deviceOptions.setSnackbar('请设置一个名称');
                                                return;
                                            }
                                            await onSave(nameVal);
                                        }}
                                        aria-label="LibraryAdd"
                                    >
                                        {id ? <SaveIcon /> : <LibraryAddIcon />}
                                    </IconButton>
                                </Tooltip>
                            </View>
                            <View
                                confirm={{
                                    id: 'delete_confirm',
                                    content: '确认删除？',
                                    open: deleteConfirm,
                                    onConfirm: async () => {
                                        await new CutAreaService(deviceId).remove(id!);
                                        setDeleteConfirm(false);
                                        setRecognitionArea([]);
                                        deviceOptions.setRecognitionAreaRect([]);
                                        deviceOptions.setCutAreaRect(DefaultCutRect);
                                        await getAreas();
                                    },
                                    onCancel: () => setDeleteConfirm(false)
                                }}
                            />
                            <Tooltip placement={'bottom'} title="删除">
                                <IconButton
                                    color={'error'}
                                    size={'small'}
                                    onClick={() => {
                                        if (!id && setMatchThreshold) {
                                            setMatchThreshold(0);
                                        }
                                        setDeleteConfirm(true);
                                    }}
                                    aria-label="Delete"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </View>
                    </View>
                </View>
            </View>
            <View
                prompt={{
                    open: !!prompt,
                    title: prompt,
                    onClose: () => {
                        setPrompt('');
                    },
                    onConfirm: async (value: string) => {
                        if (value.length === 0) {
                            return false;
                        }
                        await onSave(value);

                        setPrompt('');
                        return true;
                    }
                }}
            />
        </Card>
    );
}
