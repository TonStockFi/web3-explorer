import { View } from '@web3-explorer/uikit-view';
import { DeviceOptions } from '../types';
import { MessageLogList } from '../../../hooks/useLogs';
import Typography from '@web3-explorer/uikit-mui/dist/mui/Typography';
import * as React from 'react';

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export default function ({ deviceOptions }: { deviceOptions: DeviceOptions }) {
    const { logsUpdateAt } = deviceOptions;
    console.log(logsUpdateAt);
    return (
        <View hide={MessageLogList.length === 0} sx={{ borderRadis: 2, p: 2, bgcolor: 'black' }}>
            {MessageLogList.map((row:any, i:number) => {
                return (
                    <View row sx={{ my: 0.5 }} key={String(i)}>
                        <Typography
                            sx={{ fontSize: '10px', color: 'yellow', alignItems: 'center' }}
                            color="inherit"
                            component="div"
                        >
                            [{formatTimestamp(row.ts)}]
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '10px',
                                mr: 1,
                                ml: 1,
                                color: 'yellow',
                                alignItems: 'center'
                            }}
                            color="inherit"
                            component="div"
                        >
                            [{row.action.toUpperCase()}]
                        </Typography>
                        <Typography
                            sx={{ fontSize: '10px', mr: 1, color: 'white', alignItems: 'center' }}
                            color="inherit"
                            component="div"
                        >
                            {row.msg}
                        </Typography>
                    </View>
                );
            })}
        </View>
    );
}
