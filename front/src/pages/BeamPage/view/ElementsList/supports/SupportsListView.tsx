import type {SupportContext} from "@/contexts";
import {memo, useCallback} from "react";
import Button from "@/components/common/Button/Button";
import styled from "@emotion/styled";
import {css} from "@emotion/react";

interface SupportItemProps {
    position: number;
    support: SupportContext;
    onDelete: (position: number) => void;
    // onUpdate: (position: number, support: Partial<SupportContext>) => void;
}

interface SupportsListViewProps {
    supports: Map<number, SupportContext>;
    deleteHandler: (position: number) => void;
    updateHandler: (id: number, support: Partial<SupportContext>) => void;
}

export const SupportsListView = ({
                                     supports,
                                     deleteHandler,
                                     // updateHandler
                                 }: SupportsListViewProps) => {

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
                    />
                ))}
            </div>
        </>
    )
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

const S = {
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