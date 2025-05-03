// src/context/MarinaContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { MarinaPublicBase } from "../client";

interface MarinaContextType {
    selectedMarina: MarinaPublicBase | null;
    setSelectedMarina: (marina: MarinaPublicBase | null) => void;
}

const MarinaContext = createContext<MarinaContextType>({
    selectedMarina: null,
    setSelectedMarina: () => { },
});

export const MarinaProvider = ({ children }: { children: ReactNode }) => {
    const [selectedMarina, setSelectedMarina] = useState<MarinaPublicBase | null>(null);

    return (
        <MarinaContext.Provider value={{
            selectedMarina,
            setSelectedMarina,
        }}>
            {children}
        </MarinaContext.Provider>
    );
};

export const useMarina = () => useContext(MarinaContext);
