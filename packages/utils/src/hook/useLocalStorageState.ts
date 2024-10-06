import { useState, useEffect } from 'react';

export default function useLocalStorageState<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void] {
    const getStoredValue = (): T => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue)[0] : initialValue;
    };
    const [state, setState] = useState<T>(getStoredValue);
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify([state]));
    }, [key, state]);
    return [state, setState];
}
