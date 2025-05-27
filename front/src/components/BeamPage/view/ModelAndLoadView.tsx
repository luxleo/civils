import styled from "@emotion/styled";
import {useContext} from "react";
import {BeamContext} from "@/contexts";

const ModelAndLoadView = () => {
    const context = useContext(BeamContext);
    console.log("ModelAndLoadView");
    if (context.isBeamInitialized()) {
        return (
            <S.Container>
                <h1>Element Lists</h1>
                <div>
                    {context.beam.length}
                </div>
            </S.Container>
        );
    } else {
        return <S.Container>
            not yet
        </S.Container>
    }
};


const S = {
    Container: styled.div`
        min-width: 200px;
        flex-direction: column;
        padding: 1rem 2rem 1rem;
        background-color: tomato;
        @media (min-width: 1024px) {
            width: 450px;
        }
    `
}

export default ModelAndLoadView;