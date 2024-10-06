import { DeviceInfo, DeviceOptions, XYWHProps } from '../types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { getMonitorImageId, getMonitorOutputId, getRoiRect, isCutAreaExists } from '../global';
import { View } from '@web3-explorer/uikit-view';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { canvasToBlob } from '../../../common/opencv';
import CutAreaService from '../../../common/CutAreaService';
import CutAreaItemView from './CutAreaItemView';
import CutItems from './CutItems';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import SwipeLeftAltIcon from '@mui/icons-material/SwipeLeftAlt';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

export default function InnerView({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    const { isCutEnable, deviceId, cutAreaRect, monitorScale, recognitionAreaRect } = deviceOptions;
    const { screen, compressQuality } = deviceOptions.getDeviceInfo() as DeviceInfo;
    const [roiXYWH, setRoiXYWH] = useState<XYWHProps | undefined>(undefined);
    const [cutImageUrl, setCutImageUrl] = useState('');
    const [areaList, setAreaList] = useState<any[]>([]);

    const [matchThreshold, setMatchThreshold] = useState(0);
    const getAreas = async () => {
        const rows = (await new CutAreaService(deviceId).getAll()) as any[];
        rows.sort((a, b) => {
            return b.ts - a.ts;
        });
        setAreaList(rows);
    };
    useEffect(() => {
        (async () => {
            await getAreas();
        })();
    }, []);
    //@ts-ignore
    const { cv } = window;
    useEffect(() => {
        if (isCutEnable && cv && isCutAreaExists(cutAreaRect)) {
            (async () => {
                try {
                    let src = cv.imread(getMonitorImageId(deviceOptions));
                    let dst = new cv.Mat();
                    setMatchThreshold(0);
                    const { x, y, w, h } = getRoiRect(cutAreaRect);
                    setRoiXYWH({ x, y, w, h });
                    let rect = new cv.Rect(x, y, w, h);
                    dst = src.roi(rect);
                    cv.imshow(getMonitorOutputId(deviceOptions), dst);
                    const imgBlob = await canvasToBlob(getMonitorOutputId(deviceOptions)!);
                    if (imgBlob) {
                        setCutImageUrl(URL.createObjectURL(imgBlob));
                    }
                    src.delete();
                    dst.delete();
                } catch (e) {
                    deviceOptions.setSnackbar('截取屏幕失败！');
                    console.error(e);
                }
            })();
        }
    }, [isCutEnable, cv, cutAreaRect]);

    return (
        <View sx={{ p: 2 }} mb12>
            <View column w100p sx={{ alignItems: 'center' }} hide={!!cutImageUrl}>
                <View mb12 sx={{ my: 6 }}>
                    <HighlightAltIcon sx={{ fontSize: 40 }} />
                </View>
                <View row center mt12>
                    <View sx={{ display: 'inline-flex' }} mr12>
                        <SwipeLeftAltIcon />
                    </View>
                    <View
                        sx={{ display: 'inline-flex' }}
                        text={'请拖动左侧屏幕区域，截取屏幕区域'}
                    />
                </View>
            </View>
            <View mt12>
                <View
                    sx={{
                        display: 'none',
                        border: '1px solid #e9e9e9'
                    }}
                >
                    <canvas
                        style={{
                            display: 'none',
                            width: roiXYWH ? `${roiXYWH!.w}px` : 0,
                            height: roiXYWH ? `${roiXYWH!.h}px` : 0
                        }}
                        id={getMonitorOutputId(deviceOptions)}
                    ></canvas>
                </View>
                <View hide={!(isCutEnable && cutImageUrl.length > 0)} mt12>
                    <View mb12 hide={!isCutAreaExists(cutAreaRect)}>
                        <Alert severity="info">
                            <View row sx={{ alignItems: 'center' }}>
                                <View sx={{ display: 'inline-flex' }} text={'选取成功！请点击'} />
                                <View sx={{ display: 'inline-flex' }} mx={1}>
                                    <ImageSearchIcon fontSize={'small'} />
                                </View>
                                <View sx={{ display: 'inline-flex' }} text={'测试匹配'} />
                            </View>
                        </Alert>
                    </View>
                    <View mb12 hide={isCutAreaExists(cutAreaRect)}>
                        <Alert severity="warning">
                            <View row sx={{ alignItems: 'center' }}>
                                <View sx={{ display: 'inline-flex' }} text={'匹配成功！请点击'} />
                                <View sx={{ display: 'inline-flex' }} mx={1}>
                                    <LibraryAddIcon fontSize={'small'} />
                                </View>
                                <View sx={{ display: 'inline-flex' }} text={'保存区域'} />
                            </View>
                        </Alert>
                    </View>

                    {roiXYWH && (
                        <CutAreaItemView
                            {...{
                                setImageUrl: setCutImageUrl,
                                setAreaList,
                                areaList,
                                setMatchThreshold,
                                matchThreshold,
                                deviceOptions,
                                imageUrl: cutImageUrl,
                                roiXYWH,
                                monitorScale,
                                screen: screen!,
                                compressQuality: compressQuality!
                            }}
                        />
                    )}
                </View>

                <View mt12 mb12>
                    <Divider />
                </View>
                <CutItems getAreas={getAreas} deviceOptions={deviceOptions} areaList={areaList} />
            </View>
        </View>
    );
}
