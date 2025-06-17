import {
    Beam,
    type BeamInterface,
    StaticallyIndeterminateBeam
} from "@/pages/BeamPage/domain_temp/Beam.ts";
import type {Load} from "./Load.ts";
import type {ReactionForces, Support} from "@/pages/BeamPage/domain_temp/Support";
import {BeamContext} from "@/contexts";

export type ShearForcePoint = {
    position: number;
    shearForce: number;
};

export type ShearForceDiagram = {
    points: ShearForcePoint[];
};

export type BendingMomentPoint = {
    position: number;
    bendingMoment: number;
};

export type BendingMomentDiagram = {
    points: BendingMomentPoint[];
};

export type DeflectionPoint = {
    position: number;
    deflection: number;
};

export type DeflectionDiagram = {
    points: DeflectionPoint[];
};

// type analysisResult = {
//
// }
interface Solver {
    solve(beam: BeamInterface): void;

    calculateReactions(): Record<number, ReactionForces>;

    generateSFD(): ShearForceDiagram;

    generateBMD(): BendingMomentDiagram;

    generateDeflectionDiagram(): DeflectionDiagram;
}

export class BeamSolver implements Solver {
    private readonly beam: BeamInterface;
    private readonly loads: Load[];
    private readonly supports: Support[];
    private readonly numPoints: number;

    constructor(beamContext: BeamContext, loads: Load[], supports: Support[], numPoints?: number) {
        this.beam = this.allocateProperBeam(beamContext, supports);
        this.loads = loads;
        this.supports = supports;
        this.numPoints = numPoints ?? 10;
        this.solve(this.beam);
    }

    public solve(beam: BeamInterface): void {
        if (beam instanceof Beam) {
            this.solveSDB();
        } else if (beam instanceof StaticallyIndeterminateBeam) {
            this.solveSIB();
        } else {
            throw new Error('Unknown beam type');
        }
    }

    private allocateProperBeam(beamContext: BeamContext, supports: Support[]) {
        if (this.getProblemType(supports) === 'SDB') {
            return new Beam(beamContext.length);
        }
        return new StaticallyIndeterminateBeam(beamContext.length);
    }

    private getProblemType(supports: Support[]): "SDB" | "SIB" {
        // A beam is statically determinate if the number of unknowns (reactions) equals the number of equilibrium equations
        // For a 2D beam, we have 3 equilibrium equations: sum of forces in x, sum of forces in y, and sum of moments

        // Get the number of supports and their constraints
        let totalConstraints = 0;

        // Get the supports from the beam
        for (const support of supports) {
            if ('getNumberOfConstraints' in support) {
                totalConstraints += support.getNumberOfConstraints();
            }
        }

        // For a 2D beam, if the number of constraints equals 3, it's statically determinate
        // If it's less than 3, it's unstable; if it's more than 3, it's statically indeterminate
        return totalConstraints === 3 ? "SDB" : "SIB";
    }

    private solveSDB(): void {
        // For a statically determined beam, we can directly calculate the reactions
        // using the equilibrium equations
        this.beam.calculateReactions(this.supports, this.loads);
    }

    private solveSIB(): void {
        // For a statically indeterminate beam, we need to use additional equations
        // based on compatibility conditions or the force method
        console.log('Statically indeterminate beams are not supported yet');

        // For now, we'll try to calculate reactions using the same method as SDB
        // This might not give correct results for all cases
        this.beam.calculateReactions(this.supports, this.loads);
    }

    public calculateReactions() {
        const result: Record<number, ReactionForces> = {}
        for (const support of this.supports) {
            result[support.getPosition()] = {
                verticalForce: support.getVerticalForce(),
                horizontalForce: support.getHorizontalForce?.() || 0,
                moment: support.getMoment?.() || 0
            }
        }
        return result;
    }

    /**
     * 빔의 전단력 다이어그램(SFD)을 생성합니다.
     * @param numPoints 다이어그램에 사용할 포인트 수 (기본값 100)
     * @returns 전단력 다이어그램 데이터
     */
    public generateSFD(): ShearForceDiagram {
        // 빔의 길이 가져오기
        const beam = this.beam as BeamInterface;
        const beamLength = beam.getLength();

        // 포인트 간격 계산
        const step = beamLength / (this.numPoints - 1);

        // 결과 포인트 배열 초기화
        const points: ShearForcePoint[] = [];

        // 각 포인트에 대한 전단력 계산
        for (let i = 0; i < this.numPoints; i++) {
            const position = i * step;
            const shearForce = beam.generateShearForceAtPoint(position, this.supports, this.loads);

            points.push({
                position,
                shearForce
            });
        }

        return {points};
    }

    /**
     * 빔의 휨모멘트 다이어그램(BMD)을 생성합니다.
     * @param numPoints 다이어그램에 사용할 포인트 수 (기본값 100)
     * @returns 휨모멘트 다이어그램 데이터
     */
    public generateBMD(): BendingMomentDiagram {
        // 빔의 길이 가져오기
        const beam = this.beam as BeamInterface;
        const beamLength = beam.getLength();

        // 포인트 간격 계산
        const step = beamLength / (this.numPoints - 1);

        // 결과 포인트 배열 초기화
        const points: BendingMomentPoint[] = [];

        // 각 포인트에 대한 휨모멘트 계산
        for (let i = 0; i < this.numPoints; i++) {
            const position = i * step;
            const bendingMoment = beam.generateBendingMomentAtPoint(position, this.supports, this.loads);

            points.push({
                position,
                bendingMoment
            });
        }

        return {points};
    }

    /**
     * 빔의 처짐 다이어그램(Deflection Diagram)을 생성합니다.
     * @param numPoints 다이어그램에 사용할 포인트 수 (기본값 100)
     * @param EI 빔의 강성(Flexural Rigidity, E×I) - 영률(E)과 단면 2차 모멘트(I)의 곱 (기본값 1.0)
     * @returns 처짐 다이어그램 데이터
     */
    public generateDeflectionDiagram(EI: number = 1.0): DeflectionDiagram {
        // 빔의 길이 가져오기
        const beam = this.beam as BeamInterface;
        const beamLength = beam.getLength();

        // 포인트 간격 계산
        const step = beamLength / (this.numPoints - 1);

        // 결과 포인트 배열 초기화
        const points: DeflectionPoint[] = [];

        // 모멘트 곡선의 수치 적분을 통해 처짐 계산 (더블 적분 방법)
        // 적분 상수를 결정하기 위해 경계 조건 사용 (지지대 위치에서 처짐은 0)

        // 각 포인트에 대한 휨모멘트 계산
        const momentPoints: BendingMomentPoint[] = [];
        for (let i = 0; i < this.numPoints; i++) {
            const position = i * step;
            const bendingMoment = beam.generateBendingMomentAtPoint(position, this.supports, this.loads);
            momentPoints.push({position, bendingMoment});
        }

        // 모멘트 곡선의 첫 번째 적분 (기울기, slope)
        // EI * θ = ∫M(x) dx + C1
        const slopePoints: { position: number; slope: number }[] = [];
        let previousMoment = momentPoints[0].bendingMoment;
        let currentSlope = 0; // 초기값 (C1 = 0 가정, 나중에 경계 조건으로 조정)

        slopePoints.push({position: 0, slope: currentSlope});

        for (let i = 1; i < this.numPoints; i++) {
            const currentPosition = i * step;
            const currentMoment = momentPoints[i].bendingMoment;
            // 사다리꼴 공식을 사용한 수치 적분
            const segmentArea = (previousMoment + currentMoment) * step / 2;
            currentSlope += segmentArea / EI;
            slopePoints.push({position: currentPosition, slope: currentSlope});
            previousMoment = currentMoment;
        }

        // 기울기 곡선의 두 번째 적분 (처짐, deflection)
        // EI * y = ∫(EI * θ) dx + C2
        let previousSlope = slopePoints[0].slope;
        let currentDeflection = 0; // 초기값 (C2 = 0 가정, 나중에 경계 조건으로 조정)

        const tempPoints: { position: number; deflection: number }[] = [];
        tempPoints.push({position: 0, deflection: currentDeflection});

        for (let i = 1; i < this.numPoints; i++) {
            const currentPosition = i * step;
            const currentSlope = slopePoints[i].slope;
            // 사다리꼴 공식을 사용한 수치 적분
            const segmentArea = (previousSlope + currentSlope) * step / 2;
            currentDeflection += segmentArea;
            tempPoints.push({position: currentPosition, deflection: currentDeflection});
            previousSlope = currentSlope;
        }

        // 경계 조건 적용: 지지대 위치에서 처짐은 0
        // 선형 보정을 위한 방정식 구성
        const corrections: { a: number; b: number; }[] = [];

        for (const support of this.supports) {
            const supportPosition = support.getPosition();
            // 지지대 위치에서의 처짐값 찾기 (또는 보간)
            const idx = Math.floor(supportPosition / step);
            const ratio = (supportPosition - idx * step) / step;

            let deflectionAtSupport;
            if (idx >= this.numPoints - 1) {
                deflectionAtSupport = tempPoints[this.numPoints - 1].deflection;
            } else {
                deflectionAtSupport = tempPoints[idx].deflection * (1 - ratio) +
                    tempPoints[idx + 1].deflection * ratio;
            }

            // 선형 보정 식: a*x + b = -현재_처짐값
            corrections.push({
                a: supportPosition,
                b: 1,
            });

            // 지지대 위치에서 처짐 = 0이 되어야 함
            // 따라서 a*x + b = -현재_처짐값
            if (corrections.length >= 2) {
                // 두 개 이상의 지지대가 있는 경우, 방정식 풀기
                const a1 = corrections[0].a;
                const b1 = corrections[0].b;
                const a2 = corrections[1].a;
                const b2 = corrections[1].b;

                const det = a1 * b2 - a2 * b1;
                if (Math.abs(det) > 1e-10) { // 행렬식이 0이 아닌 경우
                    const c1 = -deflectionAtSupport;
                    const c2 = -deflectionAtSupport;

                    const slopeCorrection = (c1 * b2 - c2 * b1) / det;
                    const deflectionCorrection = (a1 * c2 - a2 * c1) / det;

                    // 모든 포인트에 보정 적용
                    for (let i = 0; i < this.numPoints; i++) {
                        const x = i * step;
                        const correctedDeflection = tempPoints[i].deflection +
                            slopeCorrection * x + deflectionCorrection;
                        points.push({
                            position: x,
                            deflection: correctedDeflection
                        });
                    }
                }
            } else {
                // 하나의 지지대만 있는 경우 (캔틸레버 빔 등)
                const deflectionCorrection = -deflectionAtSupport;

                // 모든 포인트에 보정 적용
                for (let i = 0; i < this.numPoints; i++) {
                    const correctedDeflection = tempPoints[i].deflection + deflectionCorrection;
                    points.push({
                        position: i * step,
                        deflection: correctedDeflection
                    });
                }
            }
        }

        // 지지대가 없는 경우 (특수 케이스)
        if (this.supports.length === 0) {
            for (const point of tempPoints) {
                points.push({
                    position: point.position,
                    deflection: point.deflection
                });
            }
        }

        return {points};
    }
}