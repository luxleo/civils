import {useContext} from "react";
import {BeamControllerContext} from "@/contexts/BeamControllerProvider";

export const useBeamControllerContext = () => {
    return useContext(BeamControllerContext);
}
