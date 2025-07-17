import {useContext} from "react";
import {SupportElementContext} from "@/contexts/SupportElementProvider";

export const useSupportElementContext = () => {
    return useContext(SupportElementContext);
};
