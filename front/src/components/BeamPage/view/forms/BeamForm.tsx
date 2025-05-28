import {useContext} from "react";
import {BeamContext} from "@/contexts";
import {css} from "@emotion/react";
import {z} from "zod";
import {type SubmitHandler, useForm} from "react-hook-form";
import type {ChangeModeProps} from "@/components/BeamPage/view/ModelAndLoadController";
import Button from "@/components/common/Button/Button";
import {Input} from "@/components/common/Input/Input";
import {zodResolver} from "@hookform/resolvers/zod";

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
        // formState: {errors},
    } = useForm<Inputs>({defaultValues: {length: 0}, resolver: zodResolver(FormSchema)});
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        console.log("Form submitted with data:", JSON.stringify(data));
        beam.changeLength(data.length);
    }
    return (
        <div css={S.formContainer}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input<Inputs> name={"길이"} label="length" register={register} required/>
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
