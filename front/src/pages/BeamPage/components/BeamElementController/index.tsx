import {css} from "@emotion/react";
import {useContext} from "react";
import {BeamControllerContext} from "@/contexts/BeamControllerProvider";
import FormModeSelector from "@/pages/BeamPage/components/BeamElementController/FormModeSelector";
import LoadCreateForm from "@/pages/BeamPage/components/BeamElementController/LoadCreateForm";
import BeamForm from "@/pages/BeamPage/components/BeamElementController/BeamForm";
import SupportCreateForm from "@/pages/BeamPage/components/BeamElementController/SupportCreateForm";

export default function BeamElementController() {
    return (
        <div css={S.Container}>
            <ConditionalRenderer/>
        </div>
    )
}

const ConditionalRenderer = () => {
    const {mode} = useContext(BeamControllerContext);

    switch (mode) {
        case "SELECT":
            return <FormModeSelector/>
        case "BEAM":
            return <BeamForm/>;
        case "LOAD":
            return <LoadCreateForm/>;
        case "SUPPORT":
            return <SupportCreateForm/>
        default:
            return null;
    }
}

const S = {
    Container: css`
        height: 100%;
        background-color: slategray;
    `,
}
