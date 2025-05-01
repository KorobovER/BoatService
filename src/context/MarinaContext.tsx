// src/context/MarinaContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { MarinaPublic } from "../client";

// Базовый интерфейс марины для выбора в UI
interface Marina {
    marina_id: string;
    name: string;
    logo_url: string | null;
    subregion: string;
}

interface MarinaContextType {
    selectedMarina: Marina | null;
    setSelectedMarina: (marina: Marina | null) => void;
    fullMarinaData: MarinaPublic | null;
    setFullMarinaData: (data: MarinaPublic | null) => void;
}

const MarinaContext = createContext<MarinaContextType>({
    selectedMarina: null,
    setSelectedMarina: () => { },
    fullMarinaData: null,
    setFullMarinaData: () => { },
});

export const MarinaProvider = ({ children }: { children: ReactNode }) => {
    const [selectedMarina, setSelectedMarina] = useState<Marina | null>(null);
    const [fullMarinaData, setFullMarinaData] = useState<MarinaPublic | null>(null);

    return (
        <MarinaContext.Provider value={{
            selectedMarina,
            setSelectedMarina,
            fullMarinaData,
            setFullMarinaData
        }}>
            {children}
        </MarinaContext.Provider>
    );
};

export const useMarina = () => useContext(MarinaContext);
