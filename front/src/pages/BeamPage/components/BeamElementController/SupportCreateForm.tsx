import FormBaseContainer from "@/pages/BeamPage/components/BeamElementController/FormBaseContainer";
import {useSupportElementContext} from "@/hooks/contexts/useSupportElementContext";
import {z} from "zod";
import {Controller, type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useBeamElementContext} from "@/hooks/contexts/useBeamElementContext";
import Input from "@/components/common/Input";
import type {SupportsType} from "@/types/domain/Beam";
import {css} from "@emotion/react";

type SupportOption = {
    name: string;
    type: SupportsType;
}
const supportOptions: SupportOption[] = [
    {name: "롤러", type: "roller"},
    {name: "핀", type: "pinned"},
    {name: "고정", type: "fixed"}
];

const FormSchema = z.object({
    position: z.number().min(0, {message: "지지대의 위치는 양수여야합니다."}),
    supportType: z.enum(["roller", "pinned", "fixed"], {
        required_error: "지지대 타입을 선택해주세요."
    })
});

type Input = z.infer<typeof FormSchema>;

export default function SupportCreateForm() {
    const {supports, addSupport} = useSupportElementContext();
    const {beamLength, isBeamInitialized} = useBeamElementContext();

    const {
        register,
        handleSubmit,
        control,
        formState: {errors},
        setError, // handle submit 후 추가 validation 처리를 위해 필요하다.,
        reset
    } = useForm<Input>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            supportType: 'roller',
        }
    });

    const onSubmit: SubmitHandler<Input> = (data) => {
        if (!isBeamInitialized) {
            setError("position", {message: "보를 먼저 생성해주세요.", type: "manual"});
            return;
        }
        if (supports.has(data.position)) {
            setError("position", {message: "already exists", type: "manual"});
            return;
        }
        if (data.position > beamLength) {
            setError("position", {message: "position must be less than beam length", type: "manual"});
            return;
        }
        addSupport({
            position: data.position,
            type: data.supportType, // Use form data instead of local state
        });
        reset();
    }
    return (
        <FormBaseContainer>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div css={S.FieldContainer}>
                    <label css={S.FieldLabel}>지지대 타입</label>
                    <Controller
                        name="supportType"
                        control={control}
                        render={({field}) => (
                            <SupportTypeRadioGroup
                                value={field.value}
                                onChange={field.onChange}
                                options={supportOptions}
                            />
                        )}
                    />
                    {errors.supportType && (
                        <span css={S.ErrorMessage}>{errors.supportType.message}</span>
                    )}
                </div>
                <Input
                    fieldName={'position'}
                    register={register}
                    registerOptions={{required: true, valueAsNumber: true}}
                    error={errors.position}
                />
                <input type="submit" value="Submit"/>
            </form>
        </FormBaseContainer>
    );
}

interface SupportTypeRadioGroupProps {
    value: SupportsType;
    onChange: (value: SupportsType) => void;
    options: SupportOption[];
}

const SupportTypeRadioGroup = ({value, onChange, options}: SupportTypeRadioGroupProps) => {
    return (
        <div css={S.SelectContainer}>
            {options.map(option => (
                <SupportOption
                    key={option.name}
                    support={option}
                    isFocused={option.type === value}
                    changeSupportType={onChange}
                />
            ))}
        </div>
    );
};

interface SupportOptionProps {
    support: SupportOption;
    isFocused: boolean;
    changeSupportType: (type: SupportsType) => void;
}

const SupportOption = ({support, changeSupportType, isFocused}: SupportOptionProps) => {
    return (
        <div
            css={[S.SupportOptionItem, isFocused && S.FocusedSupportOption]}
            onClick={() => changeSupportType(support.type)}
        >
            {support.name}
        </div>
    );
};

const S = {
    FieldContainer: css`
        margin-bottom: 16px;
    `,
    FieldLabel: css`
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
    `,
    SelectContainer: css`
        width: 100%;
        display: flex;
        gap: 3px;
    `,
    SupportOptionItem: css`
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        background-color: #f5f5f5;

        &:hover {
            background-color: #e0e0e0;
        }
    `,
    FocusedSupportOption: css`
        background-color: #4a90e2;
        color: white;

        &:hover {
            background-color: #3a80d2;
        }
    `,
    ErrorMessage: css`
        color: #e74c3c;
        font-size: 14px;
        margin-top: 4px;
        display: block;
    `,
    SubmitButton: css`
        background-color: #4a90e2;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 16px;

        &:hover {
            background-color: #3a80d2;
        }
    `
};
