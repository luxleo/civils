import FormBaseContainer from "@/pages/BeamPage/components/BeamElementController/FormBaseContainer";
import {z} from "zod";
import {Controller, type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useBeamElementContext} from "@/hooks/contexts/useBeamElementContext";
import {toast, ToastContainer} from "react-toastify";
import {BeamError} from "@/pages/BeamPage/constants/errorMessages";
import {css} from "@emotion/react";
import Input from "@/components/common/Input";
import {useLoadElementContext} from "@/hooks/contexts/useLoadElementContext";
import {PointLoadDto} from "@/pages/BeamPage/dto/LoadDto";
import {
    type DirectionOption,
    DirectionOptionGroup
} from "@/pages/BeamPage/components/BeamElementController/PointLoadOptionGroup";
import {useBeamControllerContext} from "@/hooks/contexts/useBeamControllerContext";
import {useEffect} from "react";

const FormSchema = z.object({
    direction: z.enum(['UP', 'DOWN']),
    magnitude: z.number().min(0, 'load must be greater than 0'),
    position: z.number().min(0, 'position must be greater than 0'),
});

type Inputs = z.infer<typeof FormSchema>;

const directions: DirectionOption[] = [
    {name: 'UP', type: 'UP'},
    {name: 'DOWN', type: 'DOWN'}
];

export default function PointLoadUpdateForm() {
    const {beamLength, isBeamInitialized} = useBeamElementContext();
    const {changeMode, getTargetId} = useBeamControllerContext();
    const {updatePointLoad, loads} = useLoadElementContext();

    const targetId = getTargetId();
    const targetPointLoad = loads.get(targetId);

    const {
        register,
        handleSubmit,
        formState: {errors},
        setError,
        control,
        reset,
        setValue
    } = useForm<Inputs>({
        resolver: zodResolver(FormSchema),

    });

    useEffect(() => {
        if (targetPointLoad && targetPointLoad instanceof PointLoadDto) {
            setValue('direction', targetPointLoad.direction);
            setValue('magnitude', targetPointLoad.magnitude);
            setValue('position', targetPointLoad.position);
        }
    }, []);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        if (!isBeamInitialized) {
            toast(BeamError.NOT_INITIALIZED + "PointLoad", {
                autoClose: 2500,
                type: "error",
            });
            return;
        }
        if (data.position > beamLength) {
            setError("position", {message: "position must be less than beam length", type: "manual"});
            return;
        }
        updatePointLoad(
            targetId,
            PointLoadDto.fromFormData({
                magnitude: data.magnitude,
                position: data.position,
                direction: data.direction,
            })
        );
        changeMode('LOAD');
    }

    return (
        <FormBaseContainer>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div css={css`
                    margin-bottom: 16px;
                `}>
                    <label css={css`
                        display: block;
                        font-weight: bold;
                        margin-bottom: .3rem;
                    `}>
                        Directions
                    </label>
                    <Controller
                        name={'direction'}
                        control={control}
                        render={({field}) => (
                            <DirectionOptionGroup
                                value={field.value}
                                onChange={field.onChange}
                                directions={directions}
                            />
                        )}
                    />
                </div>
                <Input
                    fieldName={'magnitude'}
                    register={register}
                    registerOptions={{required: true, valueAsNumber: true}}
                    error={errors.magnitude}
                />
                <Input
                    fieldName={'position'}
                    register={register}
                    registerOptions={{required: true, valueAsNumber: true}}
                    error={errors.position}
                />
                <input type="submit" value="Submit"/>
            </form>
            <ToastContainer/>
        </FormBaseContainer>
    )
}
