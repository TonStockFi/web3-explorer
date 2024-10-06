import * as React from 'react';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import Switch from '@mui/material/Switch';
import { Box } from '@mui/material';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import Button from '@mui/material/Button';

export default function Permissions({
    serviceInputIsOpen,
    handleMediaService,
    serviceMediaIsRunning,
    handleInputService
}: {
    handleMediaService: any;
    handleInputService: any;
    serviceInputIsOpen: boolean;
    serviceMediaIsRunning: boolean;
}) {
    return (
        <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">权限</FormLabel>
            {serviceMediaIsRunning && (
                <Box sx={{ mt: 2, mb: 4 }}>
                    <Button
                        onClick={handleMediaService}
                        startIcon={<StopCircleIcon />}
                        color="error"
                        variant="contained"
                    >
                        停止服务
                    </Button>
                </Box>
            )}

            <FormGroup>
                <FormControlLabel
                    sx={{ mb: 2 }}
                    control={
                        <Switch
                            checked={serviceMediaIsRunning}
                            onClick={handleMediaService}
                            name="service"
                        />
                    }
                    label="屏幕录制"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={serviceInputIsOpen}
                            onClick={handleInputService}
                            name="input"
                        />
                    }
                    label="输入控制"
                />
            </FormGroup>
        </FormControl>
    );
}
