import {createContext, type ReactNode, useCallback, useState} from "react";

export type ControllerMode = 'SELECT' | 'BEAM' | 'LOAD' | 'EDIT_LOAD' | 'SUPPORT' | 'EDIT_SUPPORT';

export interface BeamControllerContextProps {
    mode: ControllerMode;
    changeMode: (mode: ControllerMode) => void;
}

export const BeamControllerContext = createContext<BeamControllerContextProps>({} as BeamControllerContextProps);

export const BeamControllerProvider = ({children}: { children: ReactNode }) => {
    const [mode, setMode] = useState<ControllerMode>('SELECT');
    const changeMode = useCallback((mode: ControllerMode) => {
        setMode(mode);
    }, []);

    return (
        <BeamControllerContext.Provider value={{mode, changeMode}}>
            {children}
        </BeamControllerContext.Provider>
    )
}
