import type {Beam, StaticallyDeterminedBeam} from "./Beam.ts";
import { PointLoad, DistributedLoad} from "./Load.ts";

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
    solve(): void;

    /**
     * SDB: statically determined beam
     *
     * SIB: statically indeterminate beam
     */
    getProblemType(beam: Beam): "SDB" | "SIB";
}

export class BeamSolver implements Solver {
    private readonly beam: Beam;

    constructor(beam: Beam) {
        this.beam = beam;
    }

    public solve(): void {
        const problemType = this.getProblemType(this.beam);
        if (problemType === 'SDB') {
            this.solveSDB(this.beam);
        }else {
            this.solveSIB(this.beam);
        }
    }
    public getProblemType(beam: Beam): "SDB" | "SIB" {
        // A beam is statically determinate if the number of unknowns (reactions) equals the number of equilibrium equations
        // For a 2D beam, we have 3 equilibrium equations: sum of forces in x, sum of forces in y, and sum of moments

        // Get the number of supports and their constraints
        let totalConstraints = 0;

        // Get the supports from the beam
        const supports = beam.getSupports();
        for (const support of supports) {
            if ('getNumberOfConstraints' in support) {
                totalConstraints += support.getNumberOfConstraints();
            }
        }

        // For a 2D beam, if the number of constraints equals 3, it's statically determinate
        // If it's less than 3, it's unstable; if it's more than 3, it's statically indeterminate
        return totalConstraints === 3 ? "SDB" : "SIB";
    }

    private solveSDB(beam: Beam) : void {
        // For a statically determined beam, we can directly calculate the reactions
        // using the equilibrium equations
        beam.calculateReactions();
    }

    private solveSIB(beam: Beam) : void {
        // For a statically indeterminate beam, we need to use additional equations
        // based on compatibility conditions or the force method
        console.log('Statically indeterminate beams are not supported yet');

        // For now, we'll try to calculate reactions using the same method as SDB
        // This might not give correct results for all cases
        beam.calculateReactions();
    }

    /**
     * 빔의 전단력 다이어그램(SFD)을 생성합니다.
     * @param numPoints 다이어그램에 사용할 포인트 수 (기본값 100)
     * @returns 전단력 다이어그램 데이터
     */
    public generateSFD(numPoints: number = 100): ShearForceDiagram {
        // 빔의 길이 가져오기
        const beam = this.beam as StaticallyDeterminedBeam;
        const beamLength = beam.getLength();

        // 포인트 간격 계산
        const step = beamLength / (numPoints - 1);
        
        // 결과 포인트 배열 초기화
        const points: ShearForcePoint[] = [];
        
        // 각 포인트에 대한 전단력 계산
        for (let i = 0; i < numPoints; i++) {
            const position = i * step;
            const shearForce = this.generateShearForceAtPoint(position);
            
            points.push({
                position,
                shearForce
            });
        }
        
        return { points };
    }
    
    /**
     * 단면법(method of section)을 사용하여 특정 지점에서의 전단력을 계산합니다.
     * @param position 전단력을 계산할 빔 상의 위치
     * @returns 해당 지점에서의 전단력 값
     * @private
     */
    private generateShearForceAtPoint(position: number): number {
        // 계산에 필요한 빔 데이터 가져오기
        const beam = this.beam as StaticallyDeterminedBeam;
        const supports = beam.getSupports();
        const loads = beam.getLoads();
        
        let shearForce = 0;
        
        // 지지대 반력 고려
        for (const support of supports) {
            // 지지대가 계산 지점보다 왼쪽에 있을 경우 (단면법에 따라)
            if (support.getPosition() <= position) {
                // 수직 반력만 전단력에 영향을 줌
                shearForce += support.getVerticalForce();
            }
        }
        
        // 모든 하중 고려 (집중하중 및 분포하중)
        for (const load of loads) {
            // 집중하중 처리
            if (load instanceof PointLoad) {
                // 하중이 계산 지점보다 왼쪽에 있을 경우에만 고려
                if (load.getPosition() <= position) {
                    shearForce -= load.getMagnitude();
                }
            } 
            // 분포하중 처리
            else if (load instanceof DistributedLoad) {
                const x1 = load.getStartPosition();
                const x2 = load.getEndPosition();
                const w1 = load.getStartMagnitude();
                const w2 = load.getEndMagnitude();
                
                // 위치가 분포하중 구간 내에 있는 경우
                if (position >= x1 && position <= x2) {
                    // 해당 구간의 다항식을 사용하여 전단력 계산
                    // 선형 다항식: w(x) = w1 + (w2-w1)*(x-x1)/(x2-x1)
                    
                    // x 위치에서의 분포하중 크기
                    const wx = w1 + (w2-w1)*(position-x1)/(x2-x1);
                    
                    // 분포하중 구간 시작부터 x 위치까지의 총 하중 계산 (다항식의 적분)
                    // 적분: ∫[w1 + (w2-w1)*(t-x1)/(x2-x1)] dt, from t=x1 to t=x
                    const partialLength = position - x1;
                    const averageLoad = (w1 + wx) / 2;
                    const partialForce = averageLoad * partialLength;
                    
                    shearForce -= partialForce;
                }
                // 위치가 분포하중 구간 오른쪽에 있는 경우
                else if (position > x2) {
                    // 전체 분포하중의 영향을 고려
                    shearForce -= load.getEquivalentForce();
                }
                // 위치가 분포하중 구간 왼쪽에 있는 경우, 영향 없음
            }
        }
        
        return shearForce;
    }
    
    /**
     * 빔의 휨모멘트 다이어그램(BMD)을 생성합니다.
     * @param numPoints 다이어그램에 사용할 포인트 수 (기본값 100)
     * @returns 휨모멘트 다이어그램 데이터
     */
    public generateBMD(numPoints: number = 100): BendingMomentDiagram {
        // 빔의 길이 가져오기
        const beam = this.beam as StaticallyDeterminedBeam;
        const beamLength = beam.getLength();

        // 포인트 간격 계산
        const step = beamLength / (numPoints - 1);
        
        // 결과 포인트 배열 초기화
        const points: BendingMomentPoint[] = [];
        
        // 각 포인트에 대한 휨모멘트 계산
        for (let i = 0; i < numPoints; i++) {
            const position = i * step;
            const bendingMoment = this.generateBendingMomentAtPoint(position);
            
            points.push({
                position,
                bendingMoment
            });
        }
        
        return { points };
    }
    
    /**
     * 단면법(method of section)을 사용하여 특정 지점에서의 휨모멘트를 계산합니다.
     * @param position 휨모멘트를 계산할 빔 상의 위치
     * @returns 해당 지점에서의 휨모멘트 값
     * @private
     */
    private generateBendingMomentAtPoint(position: number): number {
        // 계산에 필요한 빔 데이터 가져오기
        const beam = this.beam as StaticallyDeterminedBeam;
        const supports = beam.getSupports();
        const loads = beam.getLoads();
        
        let bendingMoment = 0;
        
        // 지지대 반력에 의한 모멘트 고려
        for (const support of supports) {
            // 지지대가 계산 지점보다 왼쪽에 있을 경우 (단면법에 따라)
            if (support.getPosition() <= position) {
                // 수직 반력에 의한 모멘트 계산
                bendingMoment += support.getVerticalForce() * (position - support.getPosition());
                
                // 고정단 지지대의 경우 모멘트 반력도 고려
                if ('getMoment' in support && typeof support.getMoment === 'function') {
                    bendingMoment += support.getMoment();
                }
            }
        }
        
        // 모든 하중에 의한 모멘트 고려
        for (const load of loads) {
            // 집중하중 처리
            if (load instanceof PointLoad) {
                // 하중이 계산 지점보다 왼쪽에 있을 경우에만 고려
                if (load.getPosition() <= position) {
                    bendingMoment -= load.getMagnitude() * (position - load.getPosition());
                }
            } 
            // 분포하중 처리
            else if (load instanceof DistributedLoad) {
                const x1 = load.getStartPosition();
                const x2 = load.getEndPosition();
                const w1 = load.getStartMagnitude();
                const w2 = load.getEndMagnitude();
                
                // 위치가 분포하중 구간 내에 있는 경우
                if (position >= x1 && position <= x2) {
                    // 분포하중 구간 시작부터 x 위치까지의 모멘트 계산
                    const partialLength = position - x1;
                    const wx = w1 + (w2-w1)*(partialLength)/(x2-x1);
                    
                    // 부분 구간의 평균 하중 계산
                    const averageLoad = (w1 + wx) / 2;
                    const partialForce = averageLoad * partialLength;
                    
                    // 부분 구간의 중심점 계산
                    const centroidX = x1 + partialLength / 3 * (2 * w1 + wx) / (w1 + wx);
                    
                    // 부분 분포하중에 의한 모멘트 계산
                    bendingMoment -= partialForce * (position - centroidX);
                }
                // 위치가 분포하중 구간 오른쪽에 있는 경우
                else if (position > x2) {
                    // 전체 분포하중의 영향을 고려
                    // 분포하중의 합력은 중심점에 작용
                    bendingMoment -= load.getEquivalentMomentAt(position);
                }
                // 위치가 분포하중 구간 왼쪽에 있는 경우, 영향 없음
            }
        }
        
        return bendingMoment;
    }
    
    /**
     * 빔의 처짐 다이어그램(Deflection Diagram)을 생성합니다.
     * @param numPoints 다이어그램에 사용할 포인트 수 (기본값 100)
     * @param EI 빔의 강성(Flexural Rigidity, E×I) - 영률(E)과 단면 2차 모멘트(I)의 곱 (기본값 1.0)
     * @returns 처짐 다이어그램 데이터
     */
    public generateDeflectionDiagram(numPoints: number = 100, EI: number = 1.0): DeflectionDiagram {
        // 빔의 길이 가져오기
        const beam = this.beam as StaticallyDeterminedBeam;
        const beamLength = beam.getLength();
        const supports = beam.getSupports();
    
        // 포인트 간격 계산
        const step = beamLength / (numPoints - 1);
        
        // 결과 포인트 배열 초기화
        const points: DeflectionPoint[] = [];
        
        // 모멘트 곡선의 수치 적분을 통해 처짐 계산 (더블 적분 방법)
        // 적분 상수를 결정하기 위해 경계 조건 사용 (지지대 위치에서 처짐은 0)
        
        // 각 포인트에 대한 휨모멘트 계산
        const momentPoints: BendingMomentPoint[] = [];
        for (let i = 0; i < numPoints; i++) {
            const position = i * step;
            const bendingMoment = this.generateBendingMomentAtPoint(position);
            momentPoints.push({ position, bendingMoment });
        }
        
        // 모멘트 곡선의 첫 번째 적분 (기울기, slope)
        // EI * θ = ∫M(x) dx + C1
        const slopePoints: { position: number; slope: number }[] = [];
        let previousMoment = momentPoints[0].bendingMoment;
        let currentSlope = 0; // 초기값 (C1 = 0 가정, 나중에 경계 조건으로 조정)
        
        slopePoints.push({ position: 0, slope: currentSlope });
        
        for (let i = 1; i < numPoints; i++) {
            const currentPosition = i * step;
            const currentMoment = momentPoints[i].bendingMoment;
            // 사다리꼴 공식을 사용한 수치 적분
            const segmentArea = (previousMoment + currentMoment) * step / 2;
            currentSlope += segmentArea / EI;
            slopePoints.push({ position: currentPosition, slope: currentSlope });
            previousMoment = currentMoment;
        }
        
        // 기울기 곡선의 두 번째 적분 (처짐, deflection)
        // EI * y = ∫(EI * θ) dx + C2
        let previousSlope = slopePoints[0].slope;
        let currentDeflection = 0; // 초기값 (C2 = 0 가정, 나중에 경계 조건으로 조정)
        
        const tempPoints: { position: number; deflection: number }[] = [];
        tempPoints.push({ position: 0, deflection: currentDeflection });
        
        for (let i = 1; i < numPoints; i++) {
            const currentPosition = i * step;
            const currentSlope = slopePoints[i].slope;
            // 사다리꼴 공식을 사용한 수치 적분
            const segmentArea = (previousSlope + currentSlope) * step / 2;
            currentDeflection += segmentArea;
            tempPoints.push({ position: currentPosition, deflection: currentDeflection });
            previousSlope = currentSlope;
        }
        
        // 경계 조건 적용: 지지대 위치에서 처짐은 0
        // 선형 보정을 위한 방정식 구성
        const corrections: { a: number; b: number; }[] = [];
        
        for (const support of supports) {
            const supportPosition = support.getPosition();
            // 지지대 위치에서의 처짐값 찾기 (또는 보간)
            const idx = Math.floor(supportPosition / step);
            const ratio = (supportPosition - idx * step) / step;
            
            let deflectionAtSupport;
            if (idx >= numPoints - 1) {
                deflectionAtSupport = tempPoints[numPoints - 1].deflection;
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
                    for (let i = 0; i < numPoints; i++) {
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
                for (let i = 0; i < numPoints; i++) {
                    const correctedDeflection = tempPoints[i].deflection + deflectionCorrection;
                    points.push({
                        position: i * step,
                        deflection: correctedDeflection
                    });
                }
            }
        }
        
        // 지지대가 없는 경우 (특수 케이스)
        if (supports.length === 0) {
            for (const point of tempPoints) {
                points.push({
                    position: point.position,
                    deflection: point.deflection
                });
            }
        }
        
        return { points };
    }
}
