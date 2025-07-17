import type {FieldError, FieldValues, Path, RegisterOptions} from "react-hook-form";
import type {UseFormRegister} from "react-hook-form";
import {css} from "@emotion/react";

interface InputProps<T extends FieldValues> {
    label?: string;
    fieldName: Path<T>;
    register: UseFormRegister<T>;
    registerOptions?: Partial<RegisterOptions<T>>;
    error?: FieldError;
    errorBackgroundColor?: string;
}

export default function Input<T extends FieldValues>({
                                                         label,
                                                         fieldName,
                                                         register,
                                                         registerOptions = {},
                                                         error,
                                                         errorBackgroundColor = "tomato"
                                                     }: InputProps<T>) {

    const displayLabel = label || fieldName;

    return (
        <>
            <label css={S.Label}>{displayLabel}</label>
            <input css={[
                S.Input,
                error && css`
                    background-color: ${errorBackgroundColor};
                    border-color: #f44336;

                    &:focus {
                        background-color: ${errorBackgroundColor};
                        border-color: #f44336;
                        outline: none;
                        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
                    }
                `
            ]} {...register(fieldName, {...registerOptions})}/>
            {error?.message && <p css={S.InputErrorMessages}>
                {error.message}
            </p>}
        </>
    );
}

const S = {
    Label: css`
        display: block;
        font-weight: bold;
        margin-bottom: .3rem;
    `,
    Input: css`
        width: 100%;
        padding: .8rem .5rem;
        line-height: 1.7;
        font-size: .8rem;
        height: min(1.2rem);
        box-sizing: border-box;
    `,
    InputErrorMessages: css`
        margin: 3px 0;
        font-size: .8rem;
        line-height: 1;
        padding: .2rem .5rem;
        border: solid 1px red;
        background-color: #f4cfcf;
        color: red;
    `
}
