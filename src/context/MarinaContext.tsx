// src/context/MarinaContext.tsx
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { MarinaPublicBase } from "../client";

// Type for callback function to be called when marina changes
type MarinaChangeCallback = () => void;

interface MarinaContextType {
    selectedMarina: MarinaPublicBase | null;
    setSelectedMarina: (marina: MarinaPublicBase | null) => void;
    registerMarinaChangeCallback: (callback: MarinaChangeCallback) => void;
    unregisterMarinaChangeCallback: (callback: MarinaChangeCallback) => void;
}

const MarinaContext = createContext<MarinaContextType>({
    selectedMarina: null,
    setSelectedMarina: () => { },
    registerMarinaChangeCallback: () => { },
    unregisterMarinaChangeCallback: () => { },
});

export const MarinaProvider = ({ children }: { children: ReactNode }) => {
    const [selectedMarina, setSelectedMarinaState] = useState<MarinaPublicBase | null>(null);
    // Store callbacks to be called when marina changes
    const [marinaChangeCallbacks] = useState<Set<MarinaChangeCallback>>(new Set());

    // Method to register callbacks
    const registerMarinaChangeCallback = useCallback((callback: MarinaChangeCallback) => {
        marinaChangeCallbacks.add(callback);
    }, [marinaChangeCallbacks]);

    // Method to unregister callbacks
    const unregisterMarinaChangeCallback = useCallback((callback: MarinaChangeCallback) => {
        marinaChangeCallbacks.delete(callback);
    }, [marinaChangeCallbacks]);

    // Wrapper for setSelectedMarina that calls all registered callbacks
    const setSelectedMarina = useCallback((marina: MarinaPublicBase | null) => {
        setSelectedMarinaState(marina);
        
        // Execute all registered callbacks
        marinaChangeCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in marina change callback:', error);
            }
        });
    }, [marinaChangeCallbacks]);

    return (
        <MarinaContext.Provider value={{
            selectedMarina,
            setSelectedMarina,
            registerMarinaChangeCallback,
            unregisterMarinaChangeCallback,
        }}>
            {children}
        </MarinaContext.Provider>
    );
};

export const useMarina = () => useContext(MarinaContext);
