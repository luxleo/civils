import {BeamControllerContext} from "@/contexts/BeamControllerProvider";
import {useContext} from "react";
import SectionLabel from "@/pages/BeamPage/components/SectionLabel";
import {css} from "@emotion/react";
import styled from "@emotion/styled";

export default function FormModeSelector() {
    const {changeMode} = useContext(BeamControllerContext);
    return (
        <div css={S.Container}>
            <SectionLabel title="Model"/>
            <S.Button onClick={() => changeMode('BEAM')}>BEAM</S.Button>
            <S.Button onClick={() => changeMode('LOAD')}>LOAD</S.Button>
            <S.Button onClick={() => changeMode('SUPPORT')}>SUPPORT</S.Button>
        </div>
    );
}

const S = {
    Container: css`
        padding: 0 10%;
    `,
    Button: styled.button`
        width: 100%;
        margin-bottom: 10px;
        border: solid 1px;
    `
}
