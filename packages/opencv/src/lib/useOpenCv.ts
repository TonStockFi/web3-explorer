import * as React from 'react';
import { OpenCvContext, OpenCvContextType } from './OpenCvProvider';

export const useOpenCv = (): OpenCvContextType => {
    const context = React.useContext(OpenCvContext);

    if (context === undefined) {
        throw new Error('useOpenCv must be used within an OpenCvProvider');
    }

    return context;
};
