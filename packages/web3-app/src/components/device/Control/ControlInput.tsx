import SwipeDownAltIcon from '@mui/icons-material/SwipeDownAlt';
import SwipeLeftAltIcon from '@mui/icons-material/SwipeLeftAlt';
import SwipeRightAltIcon from '@mui/icons-material/SwipeRightAlt';
import SwipeUpAltIcon from '@mui/icons-material/SwipeUpAlt';
import Button from '@web3-explorer/uikit-mui/dist/mui/Button';
import ButtonGroup from '@web3-explorer/uikit-mui/dist/mui/ButtonGroup';
import { View } from '@web3-explorer/uikit-view';
import { wsSendClientEvent } from '../../../common/ws';
import { IS_DEV } from '../../../constant';

import SwipeDownIcon from '@mui/icons-material/SwipeDown';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
import Alert from '@web3-explorer/uikit-mui/dist/mui/Alert';
import { SWIPER_KIND } from '../../../types';

export default function ({ deviceOptions }: { deviceOptions: any }) {
    const { isCutEnable } = deviceOptions;
    const inputIsOpen = deviceOptions.getDeviceInfo('inputIsOpen');
    const { width, height } = getDeviceSize(deviceOptions);
    const screenWidth = width;
    const screenHeight = height;
    const { ws } = deviceOptions;

    if (isCutEnable) {
        return (
            <View>
                <Alert severity="warning">正在选取屏幕</Alert>
            </View>
        );
    }
    if (!inputIsOpen) {
        return (
            <View>
                <Alert severity="error">输入控制没有开启</Alert>
            </View>
        );
    }
    return (
        <View>
            <View hidden={IS_DEV} row mb12>
                <View mr12>
                    <Button
                        variant="contained"
                        onClick={() => {
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth / 2,
                                    y: 0,
                                    delta: screenHeight / 3,
                                    value: SWIPER_KIND.SWIPER_KIND_UP_DOWN
                                },
                                ws
                            );
                        }}
                    >
                        Demo {screenWidth} / {screenHeight} 5
                    </Button>
                </View>
            </View>
            <View mb12>
                <ButtonGroup variant="outlined" aria-label="Basic button group">
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: 0,
                                    y: screenHeight / 2,
                                    delta: screenWidth / 3,
                                    value: SWIPER_KIND.SWIPER_KIND_LEFT_RIGHT
                                },
                                ws
                            )
                        }
                        startIcon={<SwipeRightAltIcon />}
                    >
                        SwipeLeft
                    </Button>
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth,
                                    y: screenHeight / 2,
                                    delta: -screenWidth / 3,
                                    value: SWIPER_KIND.SWIPER_KIND_LEFT_RIGHT
                                },
                                ws
                            )
                        }
                        endIcon={<SwipeLeftAltIcon />}
                    >
                        SwipeRight
                    </Button>
                </ButtonGroup>
            </View>

            <View mb12>
                <ButtonGroup
                    orientation="vertical"
                    variant="outlined"
                    aria-label="Basic button group"
                >
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth / 2,
                                    y: 0,
                                    delta: screenHeight / 3,
                                    value: SWIPER_KIND.SWIPER_KIND_UP_DOWN
                                },
                                ws
                            )
                        }
                        startIcon={<SwipeDownAltIcon />}
                    >
                        SwiperDown
                    </Button>
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth / 2,
                                    y: screenHeight,
                                    delta: -screenHeight / 3,
                                    value: SWIPER_KIND.SWIPER_KIND_UP_DOWN
                                },
                                ws
                            )
                        }
                        startIcon={<SwipeUpAltIcon />}
                    >
                        SwiperUp&nbsp;&nbsp;&nbsp;&nbsp;
                    </Button>
                </ButtonGroup>
            </View>

            <View mb12>
                <ButtonGroup
                    orientation="vertical"
                    variant="outlined"
                    aria-label="Basic button group"
                >
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth / 2,
                                    y: screenHeight / 2 - 100,
                                    delta: screenHeight / 2,
                                    value: SWIPER_KIND.SWIPER_KIND_UP_DOWN_SLOW
                                },
                                ws
                            )
                        }
                        startIcon={<SwipeDownIcon />}
                    >
                        Slow SwiperDown
                    </Button>
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth / 2,
                                    y: screenHeight / 2 + 100,
                                    delta: -screenHeight / 2,
                                    value: SWIPER_KIND.SWIPER_KIND_UP_DOWN_SLOW
                                },
                                ws
                            )
                        }
                        startIcon={<SwipeUpIcon />}
                    >
                        Slow SwiperUp&nbsp;&nbsp;&nbsp;&nbsp;
                    </Button>
                </ButtonGroup>
            </View>

            <View mb12>
                <ButtonGroup
                    orientation="vertical"
                    variant="outlined"
                    aria-label="Basic button group"
                >
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth / 2,
                                    y: screenHeight / 2 - 100,
                                    delta: screenHeight / 3,
                                    value: SWIPER_KIND.SWIPER_KIND_UP_DOWN
                                },
                                ws
                            )
                        }
                        startIcon={<SwipeDownIcon />}
                    >
                        Fast SwiperDown
                    </Button>
                    <Button
                        onClick={() =>
                            wsSendClientEvent(
                                {
                                    eventType: 'swiper',
                                    x: screenWidth / 2,
                                    y: screenHeight / 2 + 100,
                                    delta: -screenHeight / 3,
                                    value: SWIPER_KIND.SWIPER_KIND_UP_DOWN
                                },
                                ws
                            )
                        }
                        startIcon={<SwipeUpIcon />}
                    >
                        Fast SwiperUp&nbsp;&nbsp;&nbsp;&nbsp;
                    </Button>
                </ButtonGroup>
            </View>
        </View>
    );
}
function getDeviceSize(deviceOptions: any): { width: any; height: any } {
    throw new Error('Function not implemented.');
}
