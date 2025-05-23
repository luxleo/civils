import styled from "@emotion/styled";
import {useState} from "react";

type ModeModel = "beam" | "support"; // TODO: add section
type ModeLoad = "pointLoad" | "moment" | "distributedLoad";
type Mode = "none" | ModeModel | ModeLoad;

interface Props {
    setMode: React.dispatch<React.SetStateAction<Mode>>;
}

const ModelAndLoadController = () => {
    const [mode, setMode] = useState<Mode>("none");
    switch (mode) {
        case "none":
            return <NoneModeView setMode={setMode}/>
        case "beam":
            return <BeamModelView setMode={setMode}/>
        case "support":
            return <SupportsModelView setMode={setMode}/>
        case "pointLoad":
            return <PointLoadModelView setMode={setMode}/>
    }
};

const NoneModeView = ({setMode}: Props) => {
    return (
        <S.Container>
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
        </S.Container>
    )
}

// Model View Section
const BeamModelView = (props: Props) => {
    return (
        <S.Container>
            beam view
            <S.MoveBackButton onClick={() => props.setMode("none")}>
                backward
            </S.MoveBackButton>
        </S.Container>
    )
}

// Loads View Section
const SupportsModelView = (props: Props) => {
    return (
        <S.Container>
            supports view
            <S.MoveBackButton onClick={() => props.setMode("none")}>
                backward
            </S.MoveBackButton>
        </S.Container>
    )
}

const S = {
    Container: styled.div`
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
    Title: styled.h1`
        margin: .2rem 0;
        font-size: 1.5rem;
    `,
    SelectButton: styled.div`
        width: 100%;
        color: white;
    `,
    MoveBackButton: styled.div`
        
    `
}

export default ModelAndLoadController;