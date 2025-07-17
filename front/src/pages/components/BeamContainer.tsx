import styled from "@emotion/styled";
import ElementsList from "./ElementsList/ElementsList";
import {css} from "@emotion/react";
import Button from "@/components/common/Button/Button";
import {useContext} from "react";
import {BeamContext} from "@/contexts";
import {BeamService} from "@/pages/BeamPage/service/BeamService";
import ElementsController from "@/pages/components/ElementsController/ElementsController";

const BeamContainer = () => {
    return (
        <S.Container>
            {/* TODO: ModelAndLoadView에서 mode 조절 하는 context 따로 파기*/}
            <ElementsController/>
            <MainPanel/>
            <ElementsList/>
        </S.Container>
    );
};

const MainPanel = () => {
    return (
        <S.MainPanel>
            <h1>Main Panel</h1>
            <div css={css`width: 100%`}>
                <BeamSolverContainer/>
            </div>
        </S.MainPanel>
    );
}

const BeamSolverContainer = () => {
    const {beam, loads, supports, isBeamInitialized} = useContext(BeamContext);
    const handleSolve = () => {
        // TODO: API 처리할 때 로직 계산 위치를 서버/브라우져로 구분한다.
        if (isBeamInitialized()) {
            const result = BeamService.analyzeBeam(
                beam,
                Array.from(loads.values()),
                Array.from(supports.values())
            );
            console.log(result);
        }
    }
    return (
        <div css={S.BeamSolverContainer}>
            <Button onClick={handleSolve}>
                solve
            </Button>
        </div>
    );
};

const S = {
    Container: styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        width: 100vw;
    `,
    BeamSolverContainer: css`
        width: 100%;
        display: flex;
        flex-direction: column;
    `,
    MainPanel: styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-grow: 1;
        background-color: beige;
    `,
}
export default BeamContainer;
