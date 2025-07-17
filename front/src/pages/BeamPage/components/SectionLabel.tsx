import {css} from "@emotion/react";

interface SectionLabelProps {
    title: string;
}

export default function SectionLabel({title}: SectionLabelProps) {
    return (
        <div css={S.Container}>
            {title}
        </div>
    )
}

const S = {
    Container: css`
        text-align: center;
        border-bottom: 1px solid;
        line-height: 1.7;
        font-size: 1.7vh;
        margin: .8rem 0;

        @media (max-width: 760px) {
            font-size: 1rem;
        }
    `,
}
