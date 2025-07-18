import {createContext, useMemo, useState} from "react";
import {type ReactNode, useCallback} from "react";
import type {SupportsType} from "@/types/domain/Beam";
import type {Load, Support} from "@/pages/BeamPage/domain_temp";

export type SupportContext = {
    type: SupportsType;
    position: number;
    toSupport(): Support;
}

// Change LoadId to be an object type

export type DirectionType = 'UP' | 'DOWN';

interface ContextToLoad {
    toLoad(): Load;
}

export type PointLoadContext = {
    id: number;
    position: number;
    magnitude: number;
    direction: DirectionType;
}

export type DistributedLoadContext = {
    id: number;
    startMagnitude: number;
    endMagnitude: number;
    startPosition: number;
    endPosition: number;
    direction: DirectionType;
}

export type AngledLoadContext = {
    id: number;
    magnitude: number;
    position: number;
    angle: number;
    direction: DirectionType;
}

export type LoadContext = (PointLoadContext | DistributedLoadContext | AngledLoadContext) & ContextToLoad;

//INFO: support의 경우 position 이 중첩될 수 없기 때문에 별도의 supportId 가 필요하지 않다.
// Load 의 경우 같은 position에도 중첩될 수 있으므로 LoadId를 통하여 구분한다.
export interface BeamContextProps {
    beamLength: number,
    changeBeamLength: (length: number) => void;
    supports: Map<number, SupportContext>;
    loads: Map<number, LoadContext>;
    addSupport: (support: SupportContext) => void;
    addLoad: (load: LoadContext) => void;
    removeSupport: (id: number) => void;
    removeLoad: (id: number) => void;
    updateSupport: (id: number, support: Partial<SupportContext>) => void;
    updatePointLoad: (id: number, load: Partial<PointLoadContext>) => void;
    updateDistributedLoad: (id: number, load: Partial<DistributedLoadContext>) => void;
    updateAngledLoad: (id: number, load: Partial<AngledLoadContext>) => void;
    isBeamInitialized: () => boolean;
}

export const BeamContext = createContext({} as BeamContextProps);

interface BeamProviderProps {
    children: ReactNode;
}

export const BeamProvider = ({children}: BeamProviderProps) => {
    const [beamLength, setBeamLength] = useState(0);
    const [supports, setSupports] = useState<Map<number, SupportContext>>(new Map());
    const [loads, setLoads] = useState<Map<number, LoadContext>>(new Map());
    const [loadId, setLoadId] = useState<number>(0);

    // OPTIMIZED: Removed unnecessary setBeamLength dependency (setState functions are stable)
    const changeBeamLength = useCallback((length: number) => {
        setBeamLength(length);
    }, []);

    // OPTIMIZED: Removed unnecessary setSupports dependency
    const addSupport = useCallback((support: SupportContext) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            newSupports.set(support.position, support);
            return newSupports;
        });
    }, []);

    // OPTIMIZED: Removed setLoads and setLoadId dependencies, kept loadId as it's actually used
    const addLoad = useCallback((load: LoadContext) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            newLoads.set(loadId, load);
            return newLoads;
        });
        setLoadId(prev => prev + 1);
    }, [loadId]);

    // OPTIMIZED: Removed unnecessary setSupports dependency
    const removeSupport = useCallback((position: number) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            newSupports.delete(position);
            return newSupports;
        });
    }, []);

    // OPTIMIZED: Removed unnecessary setLoads dependency
    const removeLoad = useCallback((id: number) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            newLoads.delete(id);
            return newLoads;
        });
    }, []);

    // OPTIMIZED: Removed unnecessary setSupports dependency
    const updateSupport = useCallback((id: number, support: Partial<SupportContext>) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            const existingSupport = newSupports.get(id);
            if (existingSupport) {
                newSupports.set(id, {...existingSupport, ...support});
            }
            return newSupports;
        });
    }, []);

    // OPTIMIZED: Removed unnecessary setLoads dependency
    const updatePointLoad = useCallback((id: number, load: Partial<PointLoadContext>) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            const existingLoad = newLoads.get(id);
            if (existingLoad && existingLoad.type === 'pointLoad') {
                newLoads.set(id, {...existingLoad, ...load});
            }
            return newLoads;
        });
    }, []);

    // OPTIMIZED: Removed unnecessary setLoads dependency
    const updateDistributedLoad = useCallback((id: number, load: Partial<DistributedLoadContext>) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            const existingLoad = newLoads.get(id);
            if (existingLoad && existingLoad.type === 'distributedLoad') {
                newLoads.set(id, {...existingLoad, ...load});
            }
            return newLoads;
        });
    }, []);

    // OPTIMIZED: Removed unnecessary setLoads dependency
    const updateAngledLoad = useCallback((id: number, load: Partial<AngledLoadContext>) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            const existingLoad = newLoads.get(id);
            if (existingLoad && existingLoad.type === 'angledLoad') {
                newLoads.set(id, {...existingLoad, ...load});
            }
            return newLoads;
        });
    }, []);

    // OPTIMIZED: This function only depends on beamLength, which is correct
    const isBeamInitialized = useCallback(() => {
        return beamLength > 0;
    }, [beamLength]);

    // BEST PRACTICE: useMemo for context value to prevent unnecessary re-renders
    // All useCallback functions are included as dependencies to ensure proper memoization
    const value = useMemo(() => {
        return {
            beamLength,
            changeBeamLength,
            supports,
            loads,
            addSupport,
            addLoad,
            removeSupport,
            removeLoad,
            updateSupport,
            updatePointLoad,
            updateDistributedLoad,
            updateAngledLoad,
            isBeamInitialized
        }
    }, [
        beamLength,
        changeBeamLength,
        supports,
        loads,
        addSupport,
        addLoad,
        removeSupport,
        removeLoad,
        updateSupport,
        updatePointLoad,
        updateDistributedLoad,
        updateAngledLoad,
        isBeamInitialized
    ]);

    return (
        <BeamContext.Provider value={value}>
            {children}
        </BeamContext.Provider>
    );
};
