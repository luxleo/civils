import styled from "@emotion/styled";
import {useContext, useState} from "react";
import type {LoadsType} from "@/types/domain/Beam";
import {BeamContext} from "@/contexts";

type ModeModel = "beam" | "support"; // TODO: add section -> type 옮기기
type ModeLoad = LoadsType;
type Mode = "none" | ModeModel | ModeLoad;

interface Props {
    setMode: React.Dispatch<React.SetStateAction<Mode>>;
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
        // case "pointLoad":
        //     return <PointLoadModelView setMode={setMode}/>
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
    const {beam} = useContext(BeamContext);
    const [beamLength, setBeamLength] = useState<number>(beam.length);
    return (
        <S.Container>
            beam view
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const length = Number(formData.get('beamLength'));
                beam.changeLength(length);
            }}>
                <input
                    name="beamLength"
                    //TODO: string 으로 유지하면서 양수로 검증하도록 하기
                    value={beamLength}
                    onChange={(e) => {
                        setBeamLength(Number(e.target.value));
                    }}
                />
            </form>
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