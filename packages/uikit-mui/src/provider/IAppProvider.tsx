import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SnackbarProps {
    message: string;
}

interface AlertProps {
    message: string;
    cancelTxt?:string
}

interface AppContextType {
    alert:undefined | AlertProps;
    backdrop: boolean;
    snackbar: undefined | { message: string };
    showBackdrop: (visible: boolean) => void;
    showSnackbar: (snackbar: boolean | SnackbarProps) => void;
    showAlert: (alert: AlertProps | boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const IAppProvider = (props:{ children: ReactNode }) => {
    const { children } = props||{}
    const [backdrop, setBackdrop] = useState(false);
    const [snackbar, setSnackbar] = useState<undefined | SnackbarProps>(undefined);
    const [alert, setAlert] = useState<undefined | AlertProps>(undefined);

    const showBackdrop = (visible: boolean) => setBackdrop(visible);
    const showSnackbar = (v: boolean | SnackbarProps) => setSnackbar(v ? v as SnackbarProps:undefined);
    const showAlert = (v: boolean | AlertProps) => setAlert(v ? v as AlertProps:undefined);

    return (
        <AppContext.Provider value={{alert, showAlert, snackbar, showSnackbar, backdrop, showBackdrop }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to use the AppContext (optional but useful)
export const useIAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
