import styled from "@emotion/styled";
import {useContext, useState} from "react";
import type {LoadsType} from "@/types/domain/Beam";
import {BeamContext} from "@/contexts";
import BeamForm from "@/components/BeamPage/view/forms/BeamForm";
import SupportForm from "@/components/BeamPage/view/forms/SupportForm";
import {formContainer} from "@/components/BeamPage/view/forms/common.style.";

type ModeModel = "beam" | "support"; // TODO: add section -> type 옮기기
type ModeLoad = LoadsType;
type Mode = "none" | ModeModel | ModeLoad;

export interface ChangeModeProps {
    setMode: React.Dispatch<React.SetStateAction<Mode>>;
}

const ModelAndLoadController = () => {
    return (
        <S.Container>
            <Renderer/>
        </S.Container>
    )
}
const Renderer = () => {
    const [mode, setMode] = useState<Mode>("none");
    switch (mode) {
        case "none":
            return <NoneModeView setMode={setMode}/>
        case "beam":
            return <BeamForm setMode={setMode}/>
        case "support":
            return <SupportForm setMode={setMode}/>
        // case "pointLoad":
        //     return <PointLoadModelView setMode={setMode}/>
    }
};

const NoneModeView = ({setMode}: ChangeModeProps) => {
    return (
        <div css={formContainer}>
            <S.Title>Model</S.Title>
            <S.SelectButton onClick={() => setMode("beam")}>
                Beam
            </S.SelectButton>
            <S.SelectButton onClick={() => setMode("support")}>
                Support
            </S.SelectButton>
            <S.Title>Loads</S.Title>
            <S.SelectButton>
                Point Loads
            </S.SelectButton>
            <S.SelectButton>
                Moments
            </S.SelectButton>
            <S.SelectButton>
                Distributed Loads
            </S.SelectButton>
        </div>
    )
}

// Loads View Section
const SupportsModelView = (props: ChangeModeProps) => {
    return (
        <S.Container>
            supports view
            <S.MoveBackButton onClick={() => props.setMode("none")}>
                backward
            </S.MoveBackButton>
        </S.Container>
    )
}

const NoneSelectBase = styled.div`
    user-select: none;
`;

const S = {
    Container: styled(NoneSelectBase)`
        display: flex;
        flex-direction: column;
        padding: 1rem 2rem 1rem;
        align-items: center;
        min-width: 200px;
        background-color: tomato;

        @media (min-width: 1024px) {
            width: 450px;
        }
    `,
    FeatureListView: styled.div`
        display: flex;
        flex-direction: column;
    `,
    Title: styled(NoneSelectBase)`
        margin: .2rem 0;
        font-size: 1.5rem;
    `,
    SelectButton: styled(NoneSelectBase)`
        width: 100%;
        color: white;
    `,
    MoveBackButton: styled(NoneSelectBase)`

    `
}

export default ModelAndLoadController;