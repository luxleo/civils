import {useBeamElementContext} from "@/hooks/contexts/useBeamElementContext";

export default function BeamInfo() {
    const {beamLength} = useBeamElementContext();
    console.log(beamLength);
    if (beamLength <= 0) return null;
    return (
        <div>
            {/*//TODO: 세팅된 유닛 같이 표시*/}
            {beamLength} m
        </div>
    )
}
