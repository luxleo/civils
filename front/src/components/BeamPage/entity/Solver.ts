import { Beam } from "./Beam.ts";
import { FixedSupport, type Support } from "./Support.ts";
import {
    MomentLoad,
    type Load, DistributedLoad
} from "./Load.ts";

/**
 * 보 구조물의 구조 해석을 수행하는 클래스
 * 다양한 하중 조건에서 정정 구조의 반력, 전단력, 휨모멘트를 계산함
 */
export class Solver {
    private beam: Beam;

    constructor(beam: Beam) {
        this.beam = beam;
    }

    /**
     * 정정 구조 조건 확인
     * @returns 정정 구조 여부
     */
    checkStaticDeterminacy(): boolean {
        return this.beam.isStaticallyDeterminate();
    }

    /**
     * 반력 계산 - 구조물 유형에 따라 적절한 해석 메서드 호출
     * @throws 정정 구조가 아닌 경우 또는 지원되지 않는 구조물 유형인 경우 예외 발생
     */
    solveReactions(): void {
        if (!this.checkStaticDeterminacy()) {
            throw new Error("이 구조물은 정정 구조가 아닙니다");
        }

        const beamInfo = this.beam.getBeamInfo();
        const supports = beamInfo.supports;
        const loads = beamInfo.loads;

        if (this.isCantileverBeam(supports)) {
            this.solveCantileverBeam(supports, loads);
        } else if (supports.length === 2) {
            this.solveSimpleBeam(supports, loads);
        } else {
            throw new Error("지원되지 않는 구조물 유형입니다");
        }
    }

    /**
     * 외팔보(캔틸레버) 여부 확인
     * @param supports 지지점 배열
     * @returns 외팔보 여부
     */
    private isCantileverBeam(supports: Support[]): boolean {
        return supports.length === 1 && supports[0] instanceof FixedSupport;
    }

    /**
     * 외팔보(캔틸레버) 해석
     * 고정단에서의 반력과 모멘트를 계산
     * @param supports 지지점 배열
     * @param loads 하중 배열
     */
    private solveCantileverBeam(supports: Support[], loads: Load[]): void {
        const fixedSupport = supports[0];

        // 수직 방향 평형방정식: ΣFy = 0
        let totalVerticalForce = 0;
        // 모멘트 평형방정식: ΣM = 0 (고정단 기준)
        let totalMoment = 0;

        // 모든 하중에 대해 순회하며 합력과 모멘트 계산
        for (const load of loads) {
            // 하중 유형에 따른 분류 처리
            if (load instanceof MomentLoad) {
                // 모멘트 하중은 수직력에 영향을 주지 않음
                // 모멘트 하중 자체가 그대로 고정단에 전달됨
                totalMoment += load.getMagnitude();
            } else if (load instanceof DistributedLoad) {
                // 사다리꼴 분포하중 처리
                const totalMagnitude = load.getMagnitude(); // 전체 하중 크기

                // 수직 반력에 전체 하중 추가
                totalVerticalForce += totalMagnitude;

                // 하중의 작용점 위치 (무게중심)에서의 모멘트 계산
                const loadPosition = load.getPosition(); // 무게중심 위치
                const distance = loadPosition - fixedSupport.getPosition();
                totalMoment += totalMagnitude * distance;
            } else {
                // 일반 집중하중 처리
                totalVerticalForce += load.getMagnitude();

                // 집중하중에 의한 모멘트 계산
                const distance = load.getPosition() - fixedSupport.getPosition();
                totalMoment += load.getMagnitude() * distance;
            }
        }

        // 고정단 반력 계산 및 설정
        fixedSupport.setReactionForceY(totalVerticalForce);
        fixedSupport.setReactionMoment(totalMoment);
        // 수평 하중이 없다면 수평 반력은 0
        fixedSupport.setReactionForceX(0);
    }

    /**
     * 단순보 해석
     * 양끝의 지지점 반력을 계산
     * @param supports 지지점 배열
     * @param loads 하중 배열
     */
    private solveSimpleBeam(supports: Support[], loads: Load[]): void {
        // 지지점 위치 정렬 (왼쪽, 오른쪽)
        const leftSupport = supports[0].getPosition() < supports[1].getPosition() 
            ? supports[0] : supports[1];
        const rightSupport = supports[0].getPosition() > supports[1].getPosition() 
            ? supports[0] : supports[1];

        const span = rightSupport.getPosition() - leftSupport.getPosition();

        // 전체 수직 하중과 좌측 지지점에 대한 모멘트 계산
        let totalVerticalForce = 0;
        let totalMomentAboutLeft = 0;

        for (const load of loads) {
            if (load instanceof MomentLoad) {
                // 모멘트 하중은 수직력에 영향을 주지 않음
                // 하지만 지지점 반력에는 영향을 줌
                const loadPosition = load.getPosition();

                // 모멘트 하중이 보 내부에 있는 경우에만 처리
                if (loadPosition >= leftSupport.getPosition() && loadPosition <= rightSupport.getPosition()) {
                    // 단순보에서 모멘트 하중의 경우:
                    // 1. 모멘트 하중 M은 왼쪽 지지점에 M*(L-x)/L의 수직력을 발생시킴
                    // 2. 오른쪽 지지점에 -M*x/L의 수직력을 발생시킴 (부호 주의)
                    // 여기서 x는 왼쪽 지지점으로부터의 거리, L은 지지점 간 거리

                    // 모멘트 하중에 의한 왼쪽 지지점에 대한 모멘트 계산
                    // 단순보에서 모멘트 하중의 경우, 모멘트 평형 방정식에 직접적으로 기여함
                    totalMomentAboutLeft += load.getMagnitude();
                }
            } else if (load instanceof DistributedLoad) {
                // 사다리꼴 분포하중 처리
                const totalMagnitude = load.getMagnitude(); // 전체 하중 크기
                totalVerticalForce += totalMagnitude;

                // 하중의 작용점(무게중심)과 왼쪽 지지점 사이의 거리
                const momentArm = load.getPosition() - leftSupport.getPosition();
                totalMomentAboutLeft += totalMagnitude * momentArm;
            } else {
                // 집중하중 처리
                totalVerticalForce += load.getMagnitude();

                // 하중의 위치와 왼쪽 지지점 사이의 거리
                const momentArm = load.getPosition() - leftSupport.getPosition();
                totalMomentAboutLeft += load.getMagnitude() * momentArm;
            }
        }

        // 오른쪽 지지점의 반력 계산 (모멘트 평형 방정식 사용)
        const rightReaction = totalMomentAboutLeft / span;

        // 왼쪽 지지점의 반력 계산 (수직 평형 방정식 사용)
        const leftReaction = totalVerticalForce - rightReaction;

        // 반력 설정
        leftSupport.setReactionForceY(leftReaction);
        rightSupport.setReactionForceY(rightReaction);

        // 수평 반력 - 수평 하중이 없으므로 0
        leftSupport.setReactionForceX(0);
        rightSupport.setReactionForceX(0);

        // 모멘트 반력 - 핀과 롤러는 모멘트를 지지할 수 없음
        leftSupport.setReactionMoment(0);
        rightSupport.setReactionMoment(0);
    }

    /**
     * 특정 위치에서의 전단력 계산
     * @param position 계산할 위치
     * @returns 전단력 값
     */
    calculateShearForce(position: number): number {
        return this.beam.calculateInternalForces(position).shearForce;
    }

    /**
     * 특정 위치에서의 휨모멘트 계산
     * @param position 계산할 위치
     * @returns 휨모멘트 값
     */
    calculateBendingMoment(position: number): number {
        return this.beam.calculateInternalForces(position).bendingMoment;
    }

    /**
     * 위치별 전단력 분포 계산
     * @param numPoints 계산 지점 수
     * @returns 위치 및 전단력 값이 담긴 배열
     */
    generateShearForceDistribution(numPoints: number = 100): { x: number, y: number }[] {
        const beamInfo = this.beam.getBeamInfo();
        const length = beamInfo.length;
        const result = [];

        // 하중이 적용되는 위치를 포함한 주요 지점 파악
        const criticalPoints = this.findCriticalPoints();

        // 특수 지점을 결과에 추가 (불연속점 처리)
        for (const point of criticalPoints) {
            if (point <= length) {
                // 불연속점 직전과 직후의 값을 모두 계산 (매우 작은 값 사용)
                const epsilon = 0.000001;

                // 직전 값 (불연속점 바로 앞)
                if (point > 0) {
                    const beforePoint = point - epsilon;
                    const shearBefore = this.calculateShearForce(beforePoint);
                    result.push({ x: beforePoint, y: shearBefore });
                }

                // 불연속점 값
                const shearAtPoint = this.calculateShearForce(point);
                result.push({ x: point, y: shearAtPoint });

                // 직후 값 (불연속점 바로 뒤)
                if (point < length) {
                    const afterPoint = point + epsilon;
                    const shearAfter = this.calculateShearForce(afterPoint);
                    result.push({ x: afterPoint, y: shearAfter });
                }
            }
        }

        // 균등 간격으로 나머지 지점 계산
        const stepSize = length / numPoints;
        for (let i = 0; i <= numPoints; i++) {
            const position = i * stepSize;

            // 이미 추가된 지점인지 확인 (중복 방지)
            const isAlreadyAdded = result.some(pt => Math.abs(pt.x - position) < 0.0001);

            if (!isAlreadyAdded) {
                const shearForce = this.calculateShearForce(position);
                result.push({ x: position, y: shearForce });
            }
        }

        // x 좌표로 정렬
        return result.sort((a, b) => a.x - b.x);
    }

    /**
     * 위치별 휨모멘트 분포 계산
     * @param numPoints 계산 지점 수
     * @returns 위치 및 휨모멘트 값이 담긴 배열
     */
    generateBendingMomentDistribution(numPoints: number = 100): { x: number, y: number }[] {
        const beamInfo = this.beam.getBeamInfo();
        const length = beamInfo.length;
        const result = [];

        // 하중이 적용되는 위치를 포함한 주요 지점 파악
        const criticalPoints = this.findCriticalPoints();

        // 특수 지점을 결과에 추가
        for (const point of criticalPoints) {
            if (point <= length) {
                const bendingMoment = this.calculateBendingMoment(point);
                result.push({ x: point, y: bendingMoment });
            }
        }

        // 균등 간격으로 나머지 지점 계산
        const stepSize = length / numPoints;
        for (let i = 0; i <= numPoints; i++) {
            const position = i * stepSize;

            // 이미 추가된 지점인지 확인 (중복 방지)
            const isAlreadyAdded = result.some(pt => Math.abs(pt.x - position) < 0.0001);

            if (!isAlreadyAdded) {
                const bendingMoment = this.calculateBendingMoment(position);
                result.push({ x: position, y: bendingMoment });
            }
        }

        // x 좌표로 정렬
        return result.sort((a, b) => a.x - b.x);
    }

    /**
     * 전단력 또는 휨모멘트가 급격히 변하는 중요 지점 찾기
     * 하중 및 지지점 위치를 포함
     */
    private findCriticalPoints(): number[] {
        const beamInfo = this.beam.getBeamInfo();
        const criticalPoints = new Set<number>();

        // 보의 시작과 끝점 추가
        criticalPoints.add(0);
        criticalPoints.add(beamInfo.length);

        // 지지점 위치 추가
        for (const support of beamInfo.supports) {
            criticalPoints.add(support.getPosition());
        }

        // 하중 위치 추가
        for (const load of beamInfo.loads) {
            if (load instanceof DistributedLoad) {
                // 분포하중은 시작점과 끝점 모두 추가
                criticalPoints.add(load.getStartPosition());
                criticalPoints.add(load.getEndPosition());
            } else {
                // 집중하중 및 모멘트하중의 위치 추가
                criticalPoints.add(load.getPosition());
            }
        }

        // 배열로 변환하여 정렬 후 반환
        return Array.from(criticalPoints).sort((a, b) => a - b);
    }

    /**
     * 보의 최대 전단력 계산
     * @returns 최대 전단력의 절대값
     */
    calculateMaxShearForce(): number {
        const criticalPoints = this.findCriticalPoints();
        let maxShear = 0;

        for (const point of criticalPoints) {
            // 각 중요 지점 직전과 직후의 전단력 확인
            const epsilon = 0.000001;

            if (point > 0) {
                const shearBefore = Math.abs(this.calculateShearForce(point - epsilon));
                maxShear = Math.max(maxShear, shearBefore);
            }

            const shearAt = Math.abs(this.calculateShearForce(point));
            maxShear = Math.max(maxShear, shearAt);

            if (point < this.beam.getBeamInfo().length) {
                const shearAfter = Math.abs(this.calculateShearForce(point + epsilon));
                maxShear = Math.max(maxShear, shearAfter);
            }
        }

        return maxShear;
    }

    /**
     * 보의 최대 휨모멘트 계산
     * @returns 최대 휨모멘트의 절대값
     */
    calculateMaxBendingMoment(): number {
        const criticalPoints = this.findCriticalPoints();
        let maxMoment = 0;

        // 전단력이 0이 되는 지점에서 모멘트가 최대/최소가 됨
        // 중요 지점 사이의 구간에서 전단력이 0이 되는 지점 찾기
        for (let i = 0; i < criticalPoints.length - 1; i++) {
            const startPos = criticalPoints[i];
            const endPos = criticalPoints[i + 1];

            // 시작점과 끝점의 전단력
            const startShear = this.calculateShearForce(startPos);
            const endShear = this.calculateShearForce(endPos);

            // 구간 내에서 전단력이 부호가 바뀌면 이분법으로 0이 되는 지점 탐색
            if (startShear * endShear <= 0 && startShear !== 0 && endShear !== 0) {
                const zeroShearPos = this.findZeroShearPosition(startPos, endPos);
                const momentAtZero = Math.abs(this.calculateBendingMoment(zeroShearPos));
                maxMoment = Math.max(maxMoment, momentAtZero);
            }

            // 중요 지점에서의 모멘트 확인
            const momentAtStart = Math.abs(this.calculateBendingMoment(startPos));
            const momentAtEnd = Math.abs(this.calculateBendingMoment(endPos));
            maxMoment = Math.max(maxMoment, momentAtStart, momentAtEnd);
        }

        return maxMoment;
    }

    /**
     * 주어진 구간에서 전단력이 0이 되는 지점 찾기 (이분법 사용)
     */
    private findZeroShearPosition(start: number, end: number, tolerance: number = 0.0001): number {
        let left = start;
        let right = end;

        while (right - left > tolerance) {
            const mid = (left + right) / 2;
            const shearAtMid = this.calculateShearForce(mid);

            if (Math.abs(shearAtMid) < tolerance) {
                return mid;
            }

            const shearAtLeft = this.calculateShearForce(left);

            // 같은 부호이면 왼쪽 값 업데이트, 다른 부호이면 오른쪽 값 업데이트
            if (shearAtMid * shearAtLeft > 0) {
                left = mid;
            } else {
                right = mid;
            }
        }

        return (left + right) / 2;
    }
}

/**
 * 이전 버전과의 호환성을 위한 StaticStructureSolver 클래스
 */
export class StaticStructureSolver extends Solver {
    constructor(beam: Beam) {
        super(beam);
    }
}
