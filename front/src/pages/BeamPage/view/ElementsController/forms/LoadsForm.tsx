import {useContext, useState} from "react";
import type {LoadsType} from "@/types/domain/Beam";
import Button from "@/components/common/Button/Button";
import {BeamContext, type PointLoadContext} from "@/contexts";
import {z} from "zod";
import {css} from "@emotion/react";
import {Input} from "@/components/common/Input/Input";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {LoadDirection} from "@/contexts/BeamProvider";
import type {ChangeModeProps} from "@/pages/BeamPage/view/ElementsController/ElementsController";
import {formContainer} from "@/pages/BeamPage/view/ElementsController/forms/common.style.";


const LoadsForm = (props: ChangeModeProps) => {
    const [loadType, setLoadType] = useState<LoadsType>("pointLoad");
    return (
        <div css={formContainer}>
            <select onChange={(e) => setLoadType(e.target.value as LoadsType)}>
                <option value="pointLoad">Point Load</option>
                <option value="distributedLoad">Distributed Load</option>
                <option value="moment">Moment</option>
            </select>
            <Renderer loadType={loadType}/>
            <Button onClick={() => props.setMode("none")}>
                뒤로가기
            </Button>
        </div>
    );
};

const Renderer = ({loadType}: { loadType: LoadsType }) => {
    switch (loadType) {
        case "pointLoad":
            return <PointLoadForm/>
        case "distributedLoad":
            return <DistributedLoadForm/>
        case "moment":
            return <MomentForm/>
        default:
            return null;
    }
}

const PointLoadSchema = z.object({
    position: z.number().min(0, {message: "힘의 작용 위치는 0보다 큰 수이어야 합니다."}),
    magnitude: z.number().min(0, {message: "작용 힘의 크기는 0보다 큰 수이어야 합니다."}),
    direction: z.enum(["upward", "downward"]),
})

type PointLoadInput = z.infer<typeof PointLoadSchema>;
const InitialPointLoadInput: PointLoadInput = {
    position: 0,
    magnitude: 0,
    direction: "downward"
}

const PointLoadForm = () => {
    const {addLoad, isBeamInitialized, beam: {length: beamLength}} = useContext(BeamContext);
    const [direction, setDirection] = useState<LoadDirection>(InitialPointLoadInput.direction)
    const {
        register,
        setValue,
        handleSubmit,
        formState: {errors},
        setError
    } = useForm<PointLoadInput>({
        defaultValues: {
            position: 0,
            magnitude: 0,
            direction: InitialPointLoadInput.direction
        },
        resolver: zodResolver(PointLoadSchema)
    });
    const onSubmitHandler = (data: PointLoadInput) => {
        if (!isBeamInitialized()) {
            setError("position", {message: "보를 먼저 생성해주세요.", type: "manual"});
        }
        if (data.position > beamLength) {
            setError("position", {message: "힘의 위치는 보를 벗어날 수 없습니다.", type: "manual"});
            return;
        }
        addLoad({
            type: "pointLoad",
            position: data.position,
            magnitude: data.magnitude,
            direction: data.direction
        } as PointLoadContext);
    }

    return (
        <div css={S.FormContainer}>
            <div css={css`
                display: flex;
                flex-direction: column;
            `}>
                <Button mode={direction === 'downward' ? 'primary' : 'none'}
                        onClick={() => {
                            setValue("direction", "downward");
                            setDirection("downward");
                        }
                        }>
                    downward
                </Button>
                <Button
                    mode={direction === 'upward' ? 'primary' : 'none'}
                    onClick={() => {
                        setValue("direction", "upward");
                        setDirection("upward");
                    }}>
                    upward
                </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmitHandler)}>
                <Input label={'위치'} fieldName={'position'} register={register}
                       registerOptions={{required: true, valueAsNumber: true}}/>
                {errors.position && <span>{errors.position.message}</span>}
                <Input label={'힘의 크기'} fieldName={'magnitude'} register={register}
                       registerOptions={{required: true, valueAsNumber: true}}/>
                {errors.magnitude && <span>{errors.magnitude.message}</span>}
                <input type="submit" value="Submit"/>
            </form>
        </div>
    )
};

const DistributedLoadForm = () => {
    return (
        <div>
            Distributed Load
        </div>
    )
}

const MomentForm = () => {
    return (
        <div>

        </div>
    )
}

const S = {
    FormContainer: css`
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem 2rem 1rem;
    `,
}

export default LoadsForm;