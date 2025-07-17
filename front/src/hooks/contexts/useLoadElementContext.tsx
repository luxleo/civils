import {useContext} from "react";
import {LoadElementContext} from "@/contexts/LoadElementProvider";

export const useLoadElementContext = () => {
    return useContext(LoadElementContext);
}
