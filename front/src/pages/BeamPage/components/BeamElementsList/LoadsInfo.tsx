import {useLoadElementContext} from "@/hooks/contexts/useLoadElementContext";
import {css} from "@emotion/react";
import type {LoadContext} from "@/contexts/LoadElementProvider";
import {PointLoadDto} from "@/pages/BeamPage/dto/LoadDto";

export default function LoadsInfo() {
    const {loads} = useLoadElementContext();
    return (
        <div css={css`
            margin-bottom: .4rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        `}>
            {Array.from(loads.entries()).map(([loadId, loadContext]) => (
                <div css={css`
                    display: flex;
                    gap: .4rem;
                    padding: 8px 12px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    border-left: 3px solid #4a90e2;
                `}>
                    <LoadInfo
                        key={loadId}
                        loadId={loadId}
                        load={loadContext}
                    />
                </div>
            ))}
        </div>
    )
}

function LoadInfo({loadId, load}: { loadId: number, load: LoadContext }) {
    if (load instanceof PointLoadDto) {
        return (
            <>
                <div css={css`
                    font-weight: 500;
                    color: #4a90e2;
                `}>
                    Point Load
                </div>
                <div css={css`
                    color: #666;
                `}>
                    {`${load.direction === 'UP' ? '+' : '-'} ${load.magnitude}kN, ${load.position}m`}
                </div>
            </>
        )
    }
    return null;
}
