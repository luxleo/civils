import type {SupportsType} from "@/types/domain/Beam";
import {createContext, type ReactNode, useCallback, useMemo, useState} from "react";

export type SupportContext = {
    type: SupportsType;
    position: number;
}

export interface SupportElementProviderProps {
    supports: Map<number, SupportContext>;
    addSupport: (support: SupportContext) => void;
    removeSupport: (id: number) => void;
    updateSupport: (id: number, support: Partial<SupportContext>) => void;
}

export const SupportElementContext = createContext({} as SupportElementProviderProps);

export const SupportElementProvider = ({children}: { children: ReactNode }) => {
    const [supports, setSupports] = useState<Map<number, SupportContext>>(new Map());
    //TODO: supportId 추가하기, 수정 또는 삭제시 필요하다.

    const addSupport = useCallback((support: SupportContext) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            newSupports.set(support.position, support);
            return newSupports;
        });
    }, []);
    const removeSupport = useCallback((position: number) => {
        setSupports(prev => {
            const newSupports = new Map(prev);
            newSupports.delete(position);
            return newSupports;
        });
    }, []);
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

    const value = useMemo(() => (
        {
            supports,
            addSupport,
            removeSupport,
            updateSupport
        }
    ), [
        addSupport,
        removeSupport,
        supports,
        updateSupport
    ])
    return (
        <SupportElementContext.Provider value={value}>
            {children}
        </SupportElementContext.Provider>
    )
}
