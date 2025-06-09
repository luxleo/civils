import {FixedSupport, type ReactionForces, type Support} from "./Support.ts";
import {type Load, type AngledLoad, PointLoad, DistributedLoad} from "./Load.ts";

export interface Beam {
    calculateReactions(supports: Support[], loads: Load[]): void;

    generateBendingMomentAtPoint(position: number, supports: Support[], loads: Load[]): number;

    generateShearForceAtPoint(position: number, supports: Support[], loads: Load[]): number;

    getLength(): number;
}

export class StaticallyDeterminedBeam implements Beam {
    private length: number;

    constructor(length: number) {
        this.length = length;
    }

    getLength(): number {
        return this.length;
    }

    /**
     * 단면법(method of section)을 사용하여 특정 지점에서의 굽힘모멘트 계산합니다.
     * @param position 전단력을 계산할 빔 상의 위치
     * @param loads
     * @param supports
     * @returns 해당 지점에서의 굽힘모멘트 값
     * @private
     */
    generateBendingMomentAtPoint(position: number, supports: Support[], loads: Load[]): number {
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
                    const wx = w1 + (w2 - w1) * (partialLength) / (x2 - x1);

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
     * 단면법(method of section)을 사용하여 특정 지점에서의 전단력을 계산합니다.
     * @param position 전단력을 계산할 빔 상의 위치
     * @param loads
     * @param supports
     * @returns 해당 지점에서의 전단력 값
     * @private
     */
    generateShearForceAtPoint(position: number, supports: Support[], loads: Load[]): number {
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
                    const wx = w1 + (w2 - w1) * (position - x1) / (x2 - x1);

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

    public calculateReactions(supports: Support[], loads: Load[]) {
        if (this.determineBeamType(supports) === 'CantileverBeam') {
            this.calculateCantileverBeamReactions(supports, loads);
        } else {
            this.calculateSimpleBeamReactions(supports, loads);
        }
    }

    private determineBeamType(supports: Support[]): 'CantileverBeam' | 'SimpleBeam' {
        if (supports.length === 1 && supports[0] instanceof FixedSupport) {
            return 'CantileverBeam';
        } else if (supports.length === 2) {
            return 'SimpleBeam';
        } else {
            throw new Error('Beam type not supported');
        }
    }

    /**
     * solve cantilever's unknown reactions using equilibrium equation.
     * @private
     */
    private calculateCantileverBeamReactions(supports: Support[], loads: Load[]) {
        const reactionForces: ReactionForces = {
            verticalForce: 0,
            horizontalForce: 0,
            moment: 0
        };
        const support = supports[0] as FixedSupport;

        for (const load of loads) {
            // Handle vertical forces for all types of loads
            reactionForces.verticalForce -= load.getEquivalentForce();

            // Handle moments for all types of loads
            reactionForces.moment! -= load.getEquivalentMomentAt(support.getPosition());

            // Handle horizontal forces for angled loads
            if ('getHorizontalForce' in load) {
                const angledLoad = load as AngledLoad;
                reactionForces.horizontalForce! -= angledLoad.getHorizontalForce();
            }
        }

        support.allocateReactions(reactionForces);
    }

    private calculateSimpleBeamReactions(supports: Support[], loads: Load[]) {
        // For a simple beam with two supports, we need to solve for the reaction forces
        // using the equilibrium equations: sum of forces = 0 and sum of moments = 0

        // Get the two supports
        if (supports.length !== 2) {
            throw new Error('Simple beam must have exactly two supports');
        }

        const support1 = supports[0];
        const support2 = supports[1];

        // Calculate the total vertical force from all loads
        let totalVerticalForce = 0;
        // Calculate the total moment about support1 from all loads
        let totalMomentAboutSupport1 = 0;

        for (const load of loads) {
            // Sum up all vertical forces
            totalVerticalForce += load.getEquivalentForce();

            // Calculate moment about support1 for each load
            totalMomentAboutSupport1 += load.getEquivalentMomentAt(support1.getPosition());
        }

        // Calculate the distance between supports
        const span = support2.getPosition() - support1.getPosition();

        // Calculate reaction at support2 using moment equilibrium about support1
        const verticalForceAtSupport2 = totalMomentAboutSupport1 / span;

        // Calculate reaction at support1 using force equilibrium
        const verticalForceAtSupport1 = totalVerticalForce - verticalForceAtSupport2;

        // Allocate reactions to the supports
        support1.allocateReactions({
            verticalForce: verticalForceAtSupport1
        });

        support2.allocateReactions({
            verticalForce: verticalForceAtSupport2
        });
    }
}
