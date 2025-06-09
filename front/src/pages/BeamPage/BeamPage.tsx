import styled from '@emotion/styled'
import BeamContainer from "@/pages/BeamPage/view/BeamContainer";
import {BeamProvider} from "@/contexts";

const BeamPage = () => {
    return (
        <S.Container>
            <BeamProvider>
                <BeamContainer/>
            </BeamProvider>
        </S.Container>
    );
};

const S = {
    Container: styled.div`
        width: 100%;
    `
}

export default BeamPage;
