import styled from '@emotion/styled'
import {css} from "@emotion/react";
import BeamElementController from "@/pages/BeamPage/components/BeamElementController";
import BeamElementsList from "@/pages/BeamPage/components/BeamElementsList";
import BeamModelRenderer from "@/pages/BeamPage/components/BeamModelRenderer";
import {SupportElementProvider} from "@/contexts/SupportElementProvider";
import {BeamElementProvider} from "@/contexts/BeamElementProvider";
import {LoadElementProvider} from "@/contexts/LoadElementProvider";
import {BeamControllerProvider} from "@/contexts/BeamControllerProvider";

export default function BeamPage() {
    return (
        <S.Container>
            <div css={S.HeadNavbar}>

            </div>
            <div css={S.PanelContainer}>
                <BeamControllerProvider>
                    <BeamElementProvider>
                        <SupportElementProvider>
                            <LoadElementProvider>
                                <BeamElementController/>
                                <BeamModelRenderer/>
                                <BeamElementsList/>
                            </LoadElementProvider>
                        </SupportElementProvider>
                    </BeamElementProvider>
                </BeamControllerProvider>
            </div>
        </S.Container>
    );
};

const S = {
    Container: styled.div`
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
    `,
    HeadNavbar: css`
        display: flex;
        height: 50px;
        background-color: tomato;
    `,
    PanelContainer: css`
        height: 100%;
        display: grid;
        grid-template-columns: minmax(250px, 18.75%) 1fr minmax(250px, 18.75%);
    `,
}
