import styled from '@emotion/styled'
const BeamPage = () => {
    return (
        <>
            <S.Header>
                Hello BeamPage
            </S.Header>
        </>
    );
};

export default BeamPage;

const S = {
    Header: styled.header`
        justify-content: center;
        width: 100vw;
        background-color: antiquewhite;
    `
}