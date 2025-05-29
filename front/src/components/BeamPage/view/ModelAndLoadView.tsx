import styled from "@emotion/styled";
import {useContext} from "react";
import {BeamContext, SupportContext} from "@/contexts";

const ModelAndLoadView = () => {
    const {beam, supports, isBeamInitialized, removeSupport} = useContext(BeamContext);
    console.log("ModelAndLoadView " + supports.size);
    if (isBeamInitialized()) {
        console.log("ModelAndLoadView inner " + supports.size);
        return (
            <S.Container>
                <h1>Element Lists</h1>
                <div>
                    {beam.length}
                </div>
                <SupportsListView supports={supports} deleteHandler={removeSupport}/>
            </S.Container>
        );
    } else {
        return <S.Container>
            not yet
        </S.Container>
    }
};

interface SupportsListViewProps {
    supports: Map<number, SupportContext>;
    deleteHandler: (position: number) => void;
}

const SupportsListView = ({supports, deleteHandler}: SupportsListViewProps) => {
    return (
        <>
            <h1>Supports List</h1>
            <div>
                {Array.from(supports.entries()).map(([position, support]) => (
                    <div key={position}>{
                        support.type + ", " + support.position
                    }</div>
                ))}
            </div>
        </>
    )
}

const S = {
    Container: styled.div`
        min-width: 200px;
        flex-direction: column;
        padding: 1rem 2rem 1rem;
        background-color: tomato;
        @media (min-width: 1024px) {
            width: 450px;
        }
    `
}

export default ModelAndLoadView;
