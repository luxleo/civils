// interface ElementInfo {
//      id: number;
// } //TODO: 상속 관계 이용하여 다형성으로 처리할 수 있도록한다. FIFO 형식의 큐로 넣기 때문이다.

import {createContext, type ReactNode, useCallback, useMemo, useState} from "react";

interface BeamElementProviderProps {
    beamLength: number;
    changeBeamLength: (beamInfo: number) => void;
    // elements: ElementInfo[] //TODO: moment, distributed load, point load 등으로 구분하여 수정 폼으로 이동할 수 있도록한다.
}

export const BeamElementContext = createContext<BeamElementProviderProps>({} as BeamElementProviderProps);

export const BeamElementProvider = ({children}: { children: ReactNode }) => {
    const [beamLength, setBeamLength] = useState<number>(0);
    const changeBeamLength = useCallback((newLength: number) => {
        setBeamLength(newLength);
    }, []);
    const value = useMemo(() =>
        ({
            beamLength,
            changeBeamLength,
        }), [beamLength, changeBeamLength]);
    return (
        <BeamElementContext.Provider value={value}>
            {children}
        </BeamElementContext.Provider>
    )
}
