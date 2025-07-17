import {useContext} from 'react';
import {BeamContext} from "@/contexts";

export const useBeamContext = () => {
    const context = useContext(BeamContext);

    if (context === undefined) {
        throw new Error('useBeamContext must be used within a BeamProvider');
    }

    return context;
};
