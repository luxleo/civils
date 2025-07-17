import type {Load} from "@/pages/BeamPage/domain_temp";
import {createContext, type ReactNode, useCallback, useMemo, useState} from "react";

export type LoadDirection = 'upward' | 'downward';

interface ContextToLoad {
    toLoad(): Load;
}

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

export type LoadContext = (PointLoadContext | DistributedLoadContext | AngledLoadContext) & ContextToLoad;

export interface LoadElementContextProps {
    loads: Map<number, LoadContext>;
    addLoad: (load: LoadContext) => void;
    updatePointLoad: (id: number, load: Partial<PointLoadContext>) => void;
    updateDistributedLoad: (id: number, load: Partial<DistributedLoadContext>) => void;
    updateAngledLoad: (id: number, load: Partial<AngledLoadContext>) => void;
    removeLoad: (id: number) => void;
}

export const LoadElementContext = createContext({} as LoadElementContextProps);

export const LoadElementProvider = ({children}: { children: ReactNode }) => {
    const [loads, setLoads] = useState<Map<number, LoadContext>>(new Map());
    const [loadId, setLoadId] = useState<number>(0);

    const addLoad = useCallback((load: LoadContext) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            newLoads.set(loadId, load);
            return newLoads;
        });
        setLoadId(prev => prev + 1);
    }, [loadId]);

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

    const removeLoad = useCallback((id: number) => {
        setLoads(prev => {
            const newLoads = new Map(prev);
            newLoads.delete(id);
            return newLoads;
        });
    }, []);

    const value = useMemo(() => ({
        loads,
        addLoad,
        updatePointLoad,
        updateDistributedLoad,
        updateAngledLoad,
        removeLoad
    }), [
        loads,
        addLoad,
        updateAngledLoad,
        updateDistributedLoad,
        updatePointLoad,
        removeLoad
    ]);
    return (
        <LoadElementContext.Provider value={value}>
            {children}
        </LoadElementContext.Provider>
    );
};
