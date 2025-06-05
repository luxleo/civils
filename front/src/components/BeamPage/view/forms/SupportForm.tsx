import {css} from "@emotion/react";
import {formContainer} from "@/components/BeamPage/view/forms/common.style.";
import {useContext, useState} from "react";
import {BeamContext} from "@/contexts";
import {z} from "zod";
import {useForm, type SubmitHandler} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/common/Input/Input";
import type {ChangeModeProps} from "@/components/BeamPage/view/ModelAndLoadController";
import type {SupportsType} from "@/types/domain/Beam";

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
});
type Input = z.infer<typeof FormSchema>;

const SupportForm = (props: ChangeModeProps) => {
    const {
        beam: {length: beamLength},
        supports,
        addSupport,
        isBeamInitialized
    } = useContext(BeamContext);
    const [supportType, setSupportType] = useState<SupportsType>("pinned");
    const {
        register,
        handleSubmit,
        formState: {errors},
        setError
    } = useForm<Input>({
        defaultValues: {position: 0},
        resolver: zodResolver(FormSchema)
    });
    const handleSupportTypeChange = (type: SupportsType) => {
        setSupportType(type);
    }
    const onSubmit: SubmitHandler<Input> = (data) => {
        if (!isBeamInitialized()) {
            setError("position", {message: "보를 먼저 생성해주세요.", type: "manual"});
            return;
        }
        if (data.position > beamLength) {
            setError("position", {message: "지지대의 위치는 보의 길이를 벗어날 수 없습니다.", type: "manual"});
            return;
        }
        for (const support of supports.keys()) {
            if (support === data.position) {
                setError("position", {message: "이미 해당 위치에 지지대가 존재합니다.", type: "manual"});
                return;
            }
        }
        addSupport({position: data.position, type: supportType})
    }
    console.log("SupportForm rendered");
    return (
        <div css={formContainer}>
            <div css={S.SelectContainer}>
                {supportOptions.map(support => <SupportOption key={support.name} support={support}
                                                              isFocused={support.type === supportType}
                                                              changeSupportType={handleSupportTypeChange}/>)}
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input label={"위치"} fieldName="position" register={register}
                       registerOptions={{required: true, valueAsNumber: true}}/>
                {errors.position && <span>{errors.position.message}</span>}
            </form>
            <button onClick={() => props.setMode("none")}>
                뒤로가기
            </button>
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
    )
}

const S = {
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
    `
}

export default SupportForm;
