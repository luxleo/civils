import {formContainer} from "@/components/BeamPage/view/forms/common.style.";
import {useState} from "react";
import type {LoadsType} from "@/types/domain/Beam";
import type {ChangeModeProps} from "@/components/BeamPage/view/ModelAndLoadController";
import Button from "@/components/common/Button/Button";


const LoadsForm = (props: ChangeModeProps) => {
    const [loadType, setLoadType] = useState<LoadsType>("pointLoad");
    return (
        <div css={formContainer}>
            <select onChange={(e) => setLoadType(e.target.value as LoadsType)}>
                <option value="pointLoad">Point Load</option>
                <option value="distributedLoad">Distributed Load</option>
                <option value="moment">Moment</option>
            </select>
            <Renderer loadType={loadType}/>
            <Button onClick={() => props.setMode("none")}>
                뒤로가기
            </Button>
        </div>
    );
};

const Renderer = ({loadType}: { loadType: LoadsType }) => {
    switch (loadType) {
        case "pointLoad":
            return <PointLoadForm/>
        case "distributedLoad":
            return <DistributedLoadForm/>
        case "moment":
            return <MomentForm/>
        default:
            return null;
    }
}

const PointLoadForm = () => {
    return (
        <div>
            Point Load
        </div>
    )
};

const DistributedLoadForm = () => {
    return (
        <div>
            Distributed Load
        </div>
    )
}

const MomentForm = () => {
    return (
        <div>

        </div>
    )
}

export default LoadsForm;