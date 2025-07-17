import {useContext} from "react";
import {BeamElementContext} from "@/contexts/BeamElementProvider";

export const useBeamElementContext = () => {
    const {beamLength, changeBeamLength} = useContext(BeamElementContext);
    const isBeamInitialized = beamLength > 0;
    return {beamLength, changeBeamLength, isBeamInitialized};
}
