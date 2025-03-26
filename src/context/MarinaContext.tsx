// src/context/MarinaContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface Marina {
    marina_id: string;
    name: string;
    logo_url: string | null;
    subregion: string;
}

interface MarinaContextType {
    selectedMarina: Marina | null;
    setSelectedMarina: (marina: Marina | null) => void;
}

const MarinaContext = createContext<MarinaContextType>({
    selectedMarina: null,
    setSelectedMarina: () => { },
});

export const MarinaProvider = ({ children }: { children: ReactNode }) => {
    const [selectedMarina, setSelectedMarina] = useState<Marina | null>(null);

    return (
        <MarinaContext.Provider value={{ selectedMarina, setSelectedMarina }}>
            {children}
        </MarinaContext.Provider>
    );
};

export const useMarina = () => useContext(MarinaContext);