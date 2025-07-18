import type {DirectionType} from "@/contexts/LoadElementProvider";
import {css} from "@emotion/react";

export interface DirectionOption {
    name: string;
    type: DirectionType;
}

interface DirectionsGroupProps {
    value: DirectionType;
    onChange: (value: DirectionType) => void,
    directions: DirectionOption[];
}

export function DirectionOptionGroup({
                                         value,
                                         onChange,
                                         directions
                                     }: DirectionsGroupProps) {
    return (
        <div css={css`
            width: 100%;
            display: flex;
            justify-content: center;
            gap: 3px;
        `}>
            {directions.map(direction => (
                <DirectionOption
                    key={direction.name}
                    direction={direction}
                    isFocused={direction.type === value}
                    changeDirectionType={onChange}
                />
            ))}
        </div>
    )
}

interface DirectionOptionProps {
    direction: DirectionOption;
    isFocused: boolean;
    changeDirectionType: (value: DirectionType) => void;
}

function DirectionOption({direction, changeDirectionType, isFocused}: DirectionOptionProps) {
    return (
        <div
            css={[css`
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s ease;
                background-color: #f5f5f5;
            `, isFocused && css`
                background-color: #4a90e2;
                color: white;

                &:hover {
                    background-color: #3a80d2;
                }
            `]}
            //TODO: isFocused 보기
            onClick={() => changeDirectionType(direction.type)}
        >
            {direction.name}
        </div>
    )
}
