import {useSupportElementContext} from "@/hooks/contexts/useSupportElementContext";
import {css} from "@emotion/react";

export default function SupportsInfo() {
    const {supports} = useSupportElementContext();

    return (
        <div css={css`
            margin-bottom: .4rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        `}>
            {Array.from(supports.entries()).map(([position, supportContext]) => (
                <SupportInfo
                    key={position}
                    position={supportContext.position}
                    supportType={supportContext.type}
                />
            ))}
            {supports.size === 0 && (
                <div css={css`
                    color: #666;
                    font-style: italic;
                `}>
                    지지대가 없습니다.
                </div>
            )}
        </div>
    )
}

interface SupportInfoProps {
    position: number;
    supportType: string;
}

function SupportInfo({position, supportType}: SupportInfoProps) {
    // Convert support type to Korean for display
    const getSupportTypeName = (type: string) => {
        switch (type) {
            case 'roller':
                return '롤러';
            case 'pinned':
                return '핀';
            case 'fixed':
                return '고정';
            default:
                return type;
        }
    };

    return (
        <div css={css`
            display: flex;
            gap: .4rem;
            padding: 8px 12px;
            background-color: #f8f9fa;
            border-radius: 4px;
            border-left: 3px solid #4a90e2;
        `}>
            <div css={css`
                font-weight: 500;
                color: #4a90e2;
            `}>
                {getSupportTypeName(supportType)}
            </div>
            <div css={css`
                color: #666;
            `}>
                {position} m
            </div>
        </div>
    )
}
