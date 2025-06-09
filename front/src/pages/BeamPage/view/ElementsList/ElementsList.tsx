import styled from "@emotion/styled";
import {useContext} from "react";
import {BeamContext, type LoadContext, type PointLoadContext} from "@/contexts";
import {SupportsListView} from "@/pages/BeamPage/view/ElementsList/supports/SupportsListView";

const ElementsList = () => {
    const {beam, supports, isBeamInitialized, removeSupport, updateSupport, loads} = useContext(BeamContext);
    console.log("ElementsList " + supports.size);
    if (isBeamInitialized()) {
        console.log("ElementsList inner " + supports.size);
        return (
            <S.Container>
                <h1>Element Lists</h1>
                <div>
                    {beam.length}
                </div>
                <SupportsListView
                    supports={supports}
                    deleteHandler={removeSupport}
                    updateHandler={updateSupport}
                />
                <LoadsListView loads={loads}/>
            </S.Container>
        );
    } else {
        return <S.Container>
            not yet
        </S.Container>
    }
};

interface LoadsListViewProps {
    loads: Map<number, LoadContext>;
}

interface LoadItemProps {
    loadId: number;
    load: LoadContext;
}

const PointLoadView = (props: LoadItemProps) => {
    const loadId = props.loadId;
    const pointLoad = props.load as PointLoadContext;
    return (
        <div>
            {pointLoad.type + '-' + pointLoad.position + '-' + pointLoad.magnitude + 'kN'}
        </div>
    )
}

const LoadItemController = ({
                                loadId, load
                            }: LoadItemProps) => {
    if (load.type === "pointLoad") {
        return <PointLoadView loadId={loadId} load={load}/>
    } else {
        return <div>undefined load</div>
    }
}

const LoadsListView = ({
                           loads
                       }: LoadsListViewProps) => {
    return (
        <>
            <h1>Loads List</h1>
            <div>
                {Array.from(loads.entries()).map(([loadId, load]) => (
                    <LoadItemController loadId={loadId} load={load} key={"load" + loadId}/>
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
    `,
}

export default ElementsList;
