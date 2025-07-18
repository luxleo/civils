import {createContext, type ReactNode, useCallback, useMemo, useState} from "react";

export type ControllerMode =
    | 'SELECT'
    | 'BEAM'
    | 'LOAD'
    | 'LOAD_UPDATE'
    | 'SUPPORT'
    | 'SUPPORT_UPDATE'

export interface BeamControllerContextProps {
    mode: ControllerMode;
    changeMode: (mode: ControllerMode) => void;
    getTargetId: () => number;
    changeTargetId: (id: number) => void;
}

export const BeamControllerContext = createContext<BeamControllerContextProps>({} as BeamControllerContextProps);

const UPDATE_SUFFIX = '_UPDATE';

export const BeamControllerProvider = ({children}: { children: ReactNode }) => {
    const [mode, setMode] = useState<ControllerMode>('SELECT');
    const [targetId, setTargetId] = useState<number>(0);
    const changeMode = useCallback((mode: ControllerMode) => {
        setMode(mode);
    }, []);
    const getTargetId = useCallback(() => {
        if (!mode.endsWith(UPDATE_SUFFIX)) {
            throw new Error('Invalid mode');
        }
        return targetId;
    }, [mode, targetId]);

    const changeTargetId = useCallback((id: number) => {
        setTargetId(id);
    }, []);

    const value = useMemo(() => ({
        mode,
        changeMode,
        getTargetId,
        changeTargetId,
    }), [
        mode,
        changeMode,
        getTargetId,
        changeTargetId,
    ])
    return (
        <BeamControllerContext.Provider value={value}>
            {children}
        </BeamControllerContext.Provider>
    )
}
