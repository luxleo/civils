import styled from "@emotion/styled";
import type {InputVariants} from "@/components/common/Input/Input.type";
import {css} from "@emotion/react";

export const ManualInput = styled.input<{ variant: InputVariants; }>`
    width: 100%;
    padding: 1.2rem 0 1.6rem;
    border-radius: 8px;
`;

export const Input = css`
    width: 100%;
    padding: 1.2rem 0 1.6rem;
    border-radius: 8px;
`
