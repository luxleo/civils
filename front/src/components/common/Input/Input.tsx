import type {FieldValues, Path, RegisterOptions} from "react-hook-form";
import * as S from "./Input.styled";
import type {UseFormRegister} from "react-hook-form";

interface InputProps<T extends FieldValues> {
    label: string;
    fieldName: Path<T>;
    register: UseFormRegister<T>;
    registerOptions?: Partial<RegisterOptions<T>>;
}

export const Input =
    <T extends FieldValues>({label, fieldName, register, registerOptions = {}}: InputProps<T>) => {
        return (
            <>
                <label>{label}</label>
                <input css={S.Input} {...register(fieldName, {...registerOptions})}/>
            </>
        );
    }