import styled from "@emotion/styled";
import {useContext, memo, useCallback} from "react";
import {BeamContext, type SupportContext} from "@/contexts";
import {css} from "@emotion/react";
import Button from "@/components/common/Button/Button";

const ModelAndLoadView = () => {
    const {beam, supports, isBeamInitialized, removeSupport, updateSupport} = useContext(BeamContext);
    console.log("ModelAndLoadView " + supports.size);
    if (isBeamInitialized()) {
        console.log("ModelAndLoadView inner " + supports.size);
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
            </S.Container>
        );
    } else {
        return <S.Container>
            not yet
        </S.Container>
    }
};

const LoadsViewStyle = {
    Container: css`
        display: flex;
    `
}

const LoadsView = () => {
    return (
        <div css={LoadsViewStyle.Container}>
            loads view
        </div>
    )
}

interface SupportsListViewProps {
    supports: Map<number, SupportContext>;
    deleteHandler: (position: number) => void;
    updateHandler: (id: number, support: Partial<SupportContext>) => void;
}

interface SupportItemProps {
    position: number;
    support: SupportContext;
    onDelete: (position: number) => void;
    // onUpdate: (position: number, support: Partial<SupportContext>) => void;
}

const SupportItem = memo(({
                              position,
                              support,
                              onDelete
// , onUpdate
                          }: SupportItemProps) => {
    // const handleEdit = useCallback(() => {
    //     // This is a placeholder for edit functionality
    //     // In a real implementation, you might want to open a modal or form
    //     const newPosition = prompt("Enter new position:", support.position.toString());
    //     if (newPosition !== null) {
    //         onUpdate(position, {position: parseFloat(newPosition)});
    //     }
    // }, [position, support.position, onUpdate]);

    const handleDelete = useCallback(() => {
        onDelete(position);
    }, [position, onDelete]);

    return (
        <S.SupportItem>
            <span>{support.type + ", " + support.position}</span>
            <S.ButtonsContainer className="buttons-container">
                {/*<Button onClick={handleEdit}>*/}
                {/*    ✏️*/}
                {/*</Button>*/}
                <Button onClick={handleDelete}>
                    🗑️
                </Button>
            </S.ButtonsContainer>
        </S.SupportItem>
    );
});

const SupportsListView = ({
                              supports,
                              deleteHandler,
                              // updateHandler
                          }: SupportsListViewProps) => {
    console.log("SupportsListView " + supports.size);

    return (
        <>
            <h1>Supports List</h1>
            <div>
                {Array.from(supports.entries()).map(([position, support]) => (
                    <SupportItem
                        key={"support" + position}
                        position={position}
                        support={support}
                        onDelete={deleteHandler}
                        // onUpdate={updateHandler}
                    />
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
    SupportDetailView: css`
        display: flex;
    `,
    SupportItem: styled.div`
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        margin-bottom: 8px;
        border-radius: 4px;
        background-color: #f5f5f5;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: #e0e0e0;
        }

        /* Show buttons container only on hover */

        & > .buttons-container {
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        &:hover > .buttons-container {
            opacity: 1;
        }
    `,
    ButtonsContainer: styled.div`
        display: flex;
        gap: 8px;

        button {
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            background-color: transparent;
            border: 1px solid #ccc;
            cursor: pointer;

            &:hover {
                background-color: #ddd;
            }
        }
    `
}

export default ModelAndLoadView;
