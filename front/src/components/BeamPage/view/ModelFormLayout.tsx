import {css} from "@emotion/react";

const ModelFormLayout = () => {
    return (
        <div css={S.Container}>
            <div></div>
            <div css={S.Middle}></div>
            <div css={S.SolveButton}>solve</div>
        </div>
    );
};

const S = {
    Container: css`
        display: flex;
        width: 100%;
    `,
    Middle: css`
        flex-grow: 1;
        background: beige;
    `,
    SolveButton: css`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 250px;
        background: mediumseagreen;
        color: white;
    `
}

export default ModelFormLayout;