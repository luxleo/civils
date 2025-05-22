import styled from '@emotion/styled'
import GraphContainer from "../components/BeamPage/GraphContainer.tsx";
import BeamSolver from "../components/BeamPage/BeamSolver";

const BeamPage = () => {
    return (
        <>
            <S.Header>
                <S.Title>Beam Analysis Tool</S.Title>
                <S.Content>
                    <BeamSolver />
                    <GraphContainer/>
                </S.Content>
            </S.Header>
        </>
    );
};

export default BeamPage;

const S = {
    Header: styled.header`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100vw;
        padding: 20px;
    `,
    Title: styled.h1`
        font-size: 2rem;
        margin-bottom: 20px;
        text-align: center;
    `,
    Content: styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1200px;
    `
}
