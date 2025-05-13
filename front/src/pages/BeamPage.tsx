import styled from '@emotion/styled'
import GraphContainer from "../components/BeamPage/GraphContainer.tsx";
const BeamPage = () => {
    return (
        <>
            <S.Header>
                Hello BeamPage
                <GraphContainer/>
            </S.Header>
        </>
    );
};

export default BeamPage;

const S = {
    Header: styled.header`
        justify-content: center;
        width: 100vw;
    `
}