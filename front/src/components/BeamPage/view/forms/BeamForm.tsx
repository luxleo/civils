import {useContext} from "react";
import {BeamContext} from "@/contexts";
import {css} from "@emotion/react";
import {z} from "zod";
import {type SubmitHandler, useForm} from "react-hook-form";
import type {ChangeModeProps} from "@/components/BeamPage/view/ModelAndLoadController";
import Button from "@/components/common/Button/Button";
import {Input} from "@/components/common/Input/Input";
import {zodResolver} from "@hookform/resolvers/zod";
import {formContainer} from "@/components/BeamPage/view/forms/common.style.";

const FormSchema = z.object({
    length: z.number().gte(0, {message: "길이는 양수이어야합니다."})
});

type Inputs = z.infer<typeof FormSchema>;

const BeamForm = (props: ChangeModeProps) => {
    const {beam} = useContext(BeamContext);
    const {
        register,
        handleSubmit,
        // trigger,
        // getValues,
        formState: {errors},
    } = useForm<Inputs>({defaultValues: {length: 0}, resolver: zodResolver(FormSchema)});
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        beam.changeLength(data.length);
    }
    console.log("i rendered");
    return (
        <div css={formContainer}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input<Inputs> label={"길이"} fieldName="length" register={register}
                               registerOptions={{required: true, valueAsNumber: true}}/>
                {errors.length && <span>{errors.length.message}</span>}
                <input type="submit" value="Submit"/>
            </form>
            <Button onClick={() => props.setMode("none")}>
                뒤로가기
            </Button>
        </div>
    );
};

const S = {
    formContainer: css`
        width: 100%;
        display: flex;
    `
}

export default BeamForm;
