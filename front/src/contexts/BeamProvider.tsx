import {createContext} from "react";
import {type ReactNode, useState, useCallback} from "react";
import type {SupportsType} from "@/types/domain/Beam";

export type BeamContext = {
    length: number;
    changeLength: (length: number) => void;
}

export type SupportContext = {
    type: SupportsType;
    position: number;
}

// Change LoadId to be an object type

export type LoadDirection = 'upward' | 'downward';

export type PointLoadContext = {
    type: 'pointLoad';
    position: number;
    magnitude: number;
    direction: LoadDirection;
}

export type DistributedLoadContext = {
    type: 'distributedLoad';
    startMagnitude: number;
    endMagnitude: number;
    startPosition: number;
    endPosition: number;
    direction: LoadDirection;
}

export type AngledLoadContext = {
    type: 'angledLoad';
    magnitude: number;
    position: number;
    angle: number;
    direction: LoadDirection;
}

export type LoadContext = PointLoadContext | DistributedLoadContext | AngledLoadContext;

//INFO: support의 경우 position 이 중첩될 수 없기 때문에 별도의 supportId 가 필요하지 않다.
// Load 의 경우 같은 position에도 중첩될 수 있으므로 LoadId를 통하여 구분한다.
export interface BeamContextProps {
    beam: BeamContext;
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
    const [beam, setBeam] = useState<BeamContext>({
        length: 0,
        changeLength: (length) => setBeam(prev => ({...prev, length}))
    });
    const [supports, setSupports] = useState<Map<number, SupportContext>>(new Map());
    const [loads, setLoads] = useState<Map<number, LoadContext>>(new Map());
    const [loadId, setLoadId] = useState<number>(0);

    const addSupport = useCallback((support: SupportContext) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            newSupports.set(support.position, support);
            return newSupports;
        });
    }, [setSupports]);

    const addLoad = useCallback((load: LoadContext) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            newLoads.set(loadId, load);
            return newLoads;
        });
        setLoadId(prev => prev + 1);
    }, [loadId, setLoads, setLoadId]);

    const removeSupport = useCallback((position: number) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            newSupports.delete(position);
            return newSupports;
        });
    }, [setSupports]);

    const removeLoad = useCallback((id: number) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            newLoads.delete(id);
            return newLoads;
        });
    }, [setLoads]);

    const updateSupport = useCallback((id: number, support: Partial<SupportContext>) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            const existingSupport = newSupports.get(id);
            if (existingSupport) {
                newSupports.set(id, {...existingSupport, ...support});
            }
            return newSupports;
        });
    }, [setSupports]);

    const updatePointLoad = useCallback((id: number, load: Partial<PointLoadContext>) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            const existingLoad = newLoads.get(id);
            if (existingLoad && existingLoad.type === 'pointLoad') {
                newLoads.set(id, {...existingLoad, ...load});
            }
            return newLoads;
        });
    }, [setLoads]);

    const updateDistributedLoad = useCallback((id: number, load: Partial<DistributedLoadContext>) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            const existingLoad = newLoads.get(id);
            if (existingLoad && existingLoad.type === 'distributedLoad') {
                newLoads.set(id, {...existingLoad, ...load});
            }
            return newLoads;
        });
    }, [setLoads]);

    const updateAngledLoad = useCallback((id: number, load: Partial<AngledLoadContext>) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            const existingLoad = newLoads.get(id);
            if (existingLoad && existingLoad.type === 'angledLoad') {
                newLoads.set(id, {...existingLoad, ...load});
            }
            return newLoads;
        });
    }, [setLoads]);

    const isBeamInitialized = useCallback(() => {
        // Using supports.size in the calculation ensures this function
        // will re-evaluate when supports change
        return beam.length > 0 && supports.size >= 0;
    }, [beam.length, supports.size]);

    return (
        <BeamContext.Provider value={{
            beam,
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
        }}>
            {children}
        </BeamContext.Provider>
    );
};
