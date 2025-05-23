import styled from '@emotion/styled'
import BeamFormInput from "@/components/BeamPage/BeamFormInput.tsx";

const BeamPage = () => {
    return (
        <S.Container>
            <BeamFormInput/>
        </S.Container>
    );
};

const S = {
    Container: styled.div`
        width: 100%;
    `
}

export default BeamPage;
