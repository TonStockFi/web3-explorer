import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Permissions from './Permissions';

export default function PermissionsCard({
    serviceInputIsOpen,
    handleMediaService,
    handleInputService,
    serviceMediaIsRunning
}: {
    handleInputService: any;
    handleMediaService: any;
    serviceInputIsOpen: boolean;
    serviceMediaIsRunning: boolean;
}) {
    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Permissions
                    handleInputService={handleInputService}
                    handleMediaService={handleMediaService}
                    serviceInputIsOpen={serviceInputIsOpen}
                    serviceMediaIsRunning={serviceMediaIsRunning}
                />
            </CardContent>
        </Card>
    );
}
