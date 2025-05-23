import styled from "@emotion/styled";

const ModelAndLoadView = () => {
    return (
        <S.Container>
            <h1>Element Lists</h1>
        </S.Container>
    );
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