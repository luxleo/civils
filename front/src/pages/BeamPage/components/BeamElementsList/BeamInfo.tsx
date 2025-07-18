import {useBeamElementContext} from "@/hooks/contexts/useBeamElementContext";
import {css} from "@emotion/react";

export default function BeamInfo() {
    const {beamLength} = useBeamElementContext();
    console.log(beamLength);
    if (beamLength <= 0) return null;
    return (
        <div css={css`
            margin-bottom: .4rem;
        `}>
            {/*//TODO: 세팅된 유닛 같이 표시*/}
            {beamLength} m
        </div>
    )
}
