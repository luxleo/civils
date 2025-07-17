import {z} from "zod";
import {type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import FormBaseContainer from "@/pages/BeamPage/components/BeamElementController/FormBaseContainer";
import {useBeamElementContext} from "@/hooks/contexts/useBeamElementContext";
import Input from "@/components/common/Input";

const FormSchema = z.object({
    length: z.number().gt(0, 'length must be greater than 0'),
});

type Inputs = z.infer<typeof FormSchema>;

export default function BeamForm() {
    const {beamLength, changeBeamLength} = useBeamElementContext();
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<Inputs>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            length: beamLength,
        }
    });
    const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
        console.log(data);
        changeBeamLength(data.length);
    }
    return (
        <FormBaseContainer>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/*TODO: react 책에서 해당부분 다형성으로 어떻게 처리할 것인지 확인하기. 빔 길이 치수 정할수 있도록 하기*/}
                <Input
                    fieldName={'length'}
                    register={register}
                    registerOptions={{required: true, valueAsNumber: true}}
                    error={errors.length}
                />
                <input type="submit" value="Submit"/>
            </form>
        </FormBaseContainer>
    )
};
