import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import Stack from '@mui/material/Stack';
import LockIcon from '@mui/icons-material/Lock';
import CheckIcon from '@mui/icons-material/Check';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CircularProgress from '@mui/material/CircularProgress';

export default function DeviceCard({
    deviceId,
    connected,
    // onRefreshPassword,
    password
}: {
    connected: number;
    // onRefreshPassword: any;
    password: string;
    deviceId: string;
}) {
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
                    <FormLabel component="legend">设备</FormLabel>
                    <Box sx={{ mb: 1, mt: 1 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
                            <Box sx={{ pt: 0.1 }}>
                                <PersonIcon fontSize={'small'} sx={{ color: 'text.secondary' }} />
                            </Box>
                            <Typography
                                sx={{ color: 'text.secondary', fontWidth: 700, fontSize: '1rem' }}
                            >
                                ID
                            </Typography>
                        </Stack>
                        <Box sx={{ pl: 5 }}>
                            <Typography
                                sx={{
                                    letterSpacing: 4,
                                    color: 'text.primary',
                                    fontWeight: 700,
                                    fontSize: '1.5rem'
                                }}
                            >
                                {deviceId}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ mb: 1, mt: 1 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
                            <Box sx={{ pt: 0.1 }}>
                                <LockIcon fontSize={'small'} sx={{ color: 'text.secondary' }} />
                            </Box>
                            <Typography
                                sx={{
                                    color: 'text.secondary',
                                    fontWidth: 700,
                                    fontSize: '1rem'
                                }}
                            >
                                一次性密码
                            </Typography>
                        </Stack>
                        <Box sx={{ pl: 5 }}>
                            <Stack
                                direction="row"
                                sx={{
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Typography
                                    sx={{
                                        letterSpacing: 8,
                                        color: 'text.primary',
                                        fontWeight: 700,
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    {password}
                                </Typography>
                                {/*<Box sx={{ mt: -0.5 }}>*/}
                                {/*    <IconButton*/}
                                {/*        onClick={onRefreshPassword}*/}
                                {/*        size="small"*/}
                                {/*        aria-label="delete"*/}
                                {/*    >*/}
                                {/*        <ReplayIcon />*/}
                                {/*    </IconButton>*/}
                                {/*</Box>*/}
                            </Stack>
                        </Box>
                    </Box>
                    <Box sx={{ mb: 0, mt: 1 }}>
                        {connected === 1 && (
                            <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
                                <CheckIcon fontSize={'small'} sx={{ color: 'green' }} />
                                <Typography
                                    sx={{
                                        color: 'text.secondary',
                                        fontWidth: 700,
                                        fontSize: '1rem'
                                    }}
                                >
                                    就绪
                                </Typography>
                            </Stack>
                        )}
                        {connected === -1 && (
                            <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
                                <WarningAmberIcon fontSize={'small'} sx={{ color: 'red' }} />
                                <Typography
                                    sx={{
                                        color: 'red',
                                        fontWidth: 700,
                                        fontSize: '1rem'
                                    }}
                                >
                                    连接失败
                                </Typography>
                            </Stack>
                        )}
                        {connected === 0 && (
                            <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <CircularProgress size={16} />
                                </Box>
                                <Typography
                                    sx={{
                                        color: 'text.secondary',
                                        fontWidth: 700,
                                        fontSize: '1rem'
                                    }}
                                >
                                    连接中...
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </FormControl>
            </CardContent>
        </Card>
    );
}
