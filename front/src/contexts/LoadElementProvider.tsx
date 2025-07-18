import {createContext, type ReactNode, useCallback, useMemo, useState} from "react";
import {PointLoadDto} from "@/pages/BeamPage/dto/LoadDto";

export type DirectionType = 'UP' | 'DOWN';

export interface PointLoadContext {
    position: number;
    magnitude: number;
    direction: DirectionType;
}

export type DistributedLoadContext = {
    startMagnitude: number;
    endMagnitude: number;
    startPosition: number;
    endPosition: number;
    direction: DirectionType;
}
export type AngledLoadContext = {
    magnitude: number;
    position: number;
    angle: number;
    direction: DirectionType;
}

export type LoadContext = PointLoadContext | DistributedLoadContext | AngledLoadContext

export interface LoadElementContextProps {
    loads: Map<number, LoadContext>;
    addLoad: (load: LoadContext) => void;
    updatePointLoad: (id: number, load: Partial<PointLoadContext>) => void;
    // updateDistributedLoad: (id: number, load: Partial<DistributedLoadContext>) => void;
    // updateAngledLoad: (id: number, load: Partial<AngledLoadContext>) => void;
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
            if (existingLoad && existingLoad instanceof PointLoadDto) {
                newLoads.set(id, {...existingLoad, ...load});
            }
            return newLoads;
        });
    }, []);

    // const updateDistributedLoad = useCallback((id: number, load: Partial<DistributedLoadContext>) => {
    //     setLoads(prev => {
    //         const newLoads = new Map(prev);
    //         const existingLoad = newLoads.get(id);
    //         if (existingLoad && existingLoad.type === 'distributedLoad') {
    //             newLoads.set(id, {...existingLoad, ...load});
    //         }
    //         return newLoads;
    //     });
    // }, []);
    //
    // const updateAngledLoad = useCallback((id: number, load: Partial<AngledLoadContext>) => {
    //     setLoads(prev => {
    //         const newLoads = new Map(prev);
    //         const existingLoad = newLoads.get(id);
    //         if (existingLoad && existingLoad.type === 'angledLoad') {
    //             newLoads.set(id, {...existingLoad, ...load});
    //         }
    //         return newLoads;
    //     });
    // }, []);

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
        // updateDistributedLoad,
        // updateAngledLoad,
        removeLoad
    }), [
        loads,
        addLoad,
        // updateAngledLoad,
        // updateDistributedLoad,
        updatePointLoad,
        removeLoad
    ]);
    return (
        <LoadElementContext.Provider value={value}>
            {children}
        </LoadElementContext.Provider>
    );
};
