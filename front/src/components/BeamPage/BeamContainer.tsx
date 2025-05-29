import styled from "@emotion/styled";
import ModelAndLoadController from "./view/ModelAndLoadController.tsx";
import ModelAndLoadView from "./view/ModelAndLoadView.tsx";
import {BeamProvider} from "@/contexts";

const BeamContainer = () => {
    return (
        <S.Container>
            // TODO: ModelAndLoadView에서 mode 조절 하는 context 따로 파기
            <BeamProvider>
                <ModelAndLoadController/>
                <MainPanel/>
                <ModelAndLoadView/>
            </BeamProvider>
        </S.Container>
    );
};

const MainPanel = () => {
    return (
        <S.MainPanel>
            <h1>Main Panel</h1>
        </S.MainPanel>
    );
}

const S = {
    Container: styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        width: 100vw;
    `,
    MainPanel: styled.div`
        display: flex;
        flex-grow: 1;
        background-color: beige;
    `,
}
export default BeamContainer;