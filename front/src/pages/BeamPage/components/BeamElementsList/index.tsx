import {css} from "@emotion/react";
import SectionLabel from "@/pages/BeamPage/components/SectionLabel";
import BeamInfo from "@/pages/BeamPage/components/BeamElementsList/BeamInfo";
import SupportsInfo from "@/pages/BeamPage/components/BeamElementsList/SupportsInfo";

export default function BeamElementsList() {
    //TODO: 따로 빼야겠다. 불필요한 리렌더링 방지하기 위해서
    return (
        <div css={S.Container}>
            <SectionLabel title="Elements"/>
            <BeamInfo/>
            <SupportsInfo/>
        </div>
    )
};

const S = {
    Container: css`
        height: 100%;
        padding: 0 5%;
        background-color: slategray;
    `
}
