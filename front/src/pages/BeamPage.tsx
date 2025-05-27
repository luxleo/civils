import styled from '@emotion/styled'
import BeamContainer from "@/components/BeamPage/BeamContainer";

const BeamPage = () => {
    return (
        <S.Container>
            <BeamContainer/>
        </S.Container>
    );
};

const S = {
    Container: styled.div`
        width: 100%;
    `
}

export default BeamPage;
