import type {InputVariants} from "@/components/common/Input/Input.type";
import type {RefObject} from "react";
import type {FieldValues, Path, RegisterOptions} from "react-hook-form";
import * as S from "./Input.styled";
import type {UseFormRegister} from "react-hook-form";

interface ManualInputProps extends React.ComponentPropsWithRef<"input"> {
    variants?: InputVariants;
    ref?: RefObject<HTMLInputElement>;
}

// const Input = forwardRef<HTMLInputElement, InputProps>(({variants = "round", ...props}, ref) => {
//     return <S.Input variant={variants} {...props} ref={ref}/>;
// })
/**
 * following  input is for without react hook form
 *
 * @param variants
 * @param ref
 * @param props
 * @constructor
 */
const ManualInput = ({variants = "round", ref, ...props}: ManualInputProps) => {
    return <S.ManualInput variant={variants} {...props} ref={ref}/>;
}

interface InputProps<T extends FieldValues> {
    name: string;
    label: Path<T>;
    register: UseFormRegister<T>;
    registerOptions?: Partial<RegisterOptions<T>>;
}

export const Input = <T extends FieldValues>({name, label, register, registerOptions = {}}: InputProps<T>) => {
    return (
        <>
            <label>{name}</label>
            <input css={S.Input} {...register(label, {...registerOptions})}/>
        </>
    );
}