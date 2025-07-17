import React, {useContext} from "react";
import {css} from "@emotion/react";
import {BeamControllerContext} from "@/contexts/BeamControllerProvider";

export default function FormBaseContainer({children}: { children: React.ReactNode }) {
    const {changeMode} = useContext(BeamControllerContext);
    return (
        <div css={S.FormContainer}>
            <div>
                <button onClick={() => changeMode('SELECT')}>Home</button>
            </div>
            {children}
        </div>
    )
}

const S = {
    FormContainer: css`
        padding: .8rem 5% 0;
    `
}
