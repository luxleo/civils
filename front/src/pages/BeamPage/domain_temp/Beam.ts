import {FixedSupport, type ReactionForces, type Support} from "./Support.ts";
import {type Load, type AngledPointLoad, PointLoad, DistributedLoadImpl} from "./Load.ts";

export interface BeamInterface {
    calculateReactions(supports: Support[], loads: Load[]): void;

    generateBendingMomentAtPoint(position: number, supports: Support[], loads: Load[]): number;

    generateShearForceAtPoint(position: number, supports: Support[], loads: Load[]): number;

    getLength(): number;
}

export class Beam implements BeamInterface {

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
            bendingMoment += support.calculateMomentAtPoint(position);
        }

        // 모든 하중에 의한 모멘트 고려
        for (const load of loads) {
            // 집중하중 처리
            bendingMoment += load.getMomentAt(position);
            // TODO: load 의 인터페이스로 getEquivalentMomentAt 함수 정의 하여 다형성 지킬 것.
            // if (load instanceof PointLoad) {
            //     // 하중이 계산 지점보다 왼쪽에 있을 경우에만 고려
            //     if (load.isApplicableAt(position)) {
            //         bendingMoment += load.getEquivalentMomentAt(position);
            //     }
            // }
            // // 분포하중 처리
            // else if (load instanceof DistributedLoadImpl) {
            //     const x1 = load.getStartPosition();
            //     const x2 = load.getEndPosition();
            //     const w1 = load.getStartMagnitude();
            //     const w2 = load.getEndMagnitude();
            //
            //     // 위치가 분포하중 구간 내에 있는 경우
            //     if (position >= x1 && position <= x2) {
            //         // 분포하중 구간 시작부터 x 위치까지의 모멘트 계산
            //         const partialLength = position - x1;
            //         const wx = w1 + (w2 - w1) * (partialLength) / (x2 - x1);
            //
            //         // 부분 구간의 평균 하중 계산
            //         const averageLoad = (w1 + wx) / 2;
            //         const partialForce = averageLoad * partialLength;
            //
            //         // 부분 구간의 중심점 계산
            //         const centroidX = x1 + partialLength / 3 * (2 * w1 + wx) / (w1 + wx);
            //
            //         // 부분 분포하중에 의한 모멘트 계산
            //         bendingMoment -= partialForce * (position - centroidX);
            //     }
            //     // 위치가 분포하중 구간 오른쪽에 있는 경우
            //     else if (position > x2) {
            //         // 전체 분포하중의 영향을 고려
            //         // 분포하중의 합력은 중심점에 작용
            //         bendingMoment -= load.getEquivalentMomentAt(position);
            //     }
            //     // 위치가 분포하중 구간 왼쪽에 있는 경우, 영향 없음
            // }
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
            shearForce += support.calculateShearForceAt(position);
        }

        // 모든 하중 고려 (집중하중 및 분포하중)
        for (const load of loads) {
            shearForce += load.getShearForceAt(position);
        }

        return shearForce;
    }

    private determineBeamType(supports: Support[]): 'CantileverBeam' | 'SimpleBeam' {
        if (supports.length === 1 && supports[0].getNumberOfConstraints() === 3) {
            return 'CantileverBeam';
        } else if (supports.length === 2 && supports.reduce((acc, s) => acc + s.getNumberOfConstraints(), 0) === 3) {
            return 'SimpleBeam';
        } else {
            throw new Error('Beam type not supported or is statically indeterminate.');
        }
    }

    /**
     * Solves a system of linear equations using Gauss-Jordan elimination.
     * @param matrix The augmented matrix representing the system of equations.
     * @returns An array containing the solution values.
     */
    private gaussJordan(matrix: number[][]): number[] {
        const m = matrix.map(row => [...row]); // Create a mutable copy
        const rows = m.length;
        if (rows === 0) return [];
        const cols = m[0].length;
        let h = 0; // pivot row
        let k = 0; // pivot col

        while (h < rows && k < cols) {
            let i_max = h;
            for (let i = h + 1; i < rows; i++) {
                if (Math.abs(m[i][k]) > Math.abs(m[i_max][k])) {
                    i_max = i;
                }
            }

            if (m[i_max][k] === 0) {
                k++;
                continue;
            }

            [m[h], m[i_max]] = [m[i_max], m[h]]; // Swap rows

            const pivotValue = m[h][k];
            for (let j = k; j < cols; j++) {
                m[h][j] /= pivotValue;
            }

            for (let i = 0; i < rows; i++) {
                if (i !== h) {
                    const factor = m[i][k];
                    for (let j = k; j < cols; j++) {
                        m[i][j] -= factor * m[h][j];
                    }
                }
            }
            h++;
            k++;
        }

        return m.map(row => row[cols - 1]);
    }


    public calculateReactions(supports: Support[], loads: Load[]): void {
        const beamType = this.determineBeamType(supports);

        let totalFx = 0;
        let totalFy = 0;
        for (const load of loads) {
            if ('getHorizontalForce' in load) {
                totalFx += (load as AngledPointLoad).calculateHorizontalForce();
            }
            totalFy += load.calculateShearForce();
        }

        if (beamType === 'CantileverBeam') {
            const fixedSupport = supports[0] as FixedSupport;
            const momentRefPoint = fixedSupport.getPosition();

            let totalMomentAboutSupport = 0;
            for (const load of loads) {
                totalMomentAboutSupport += load.getEquivalentMomentAt(momentRefPoint);
            }

            // Equations for a cantilever beam (unknowns: Rh, Rv, M):
            // 1*Rh + 0*Rv + 0*M = -totalFx
            // 0*Rh + 1*Rv + 0*M = -totalFy
            // 0*Rh + 0*Rv + 1*M = -totalMomentAboutSupport
            const augmentedMatrix = [
                [1, 0, 0, -totalFx],
                [0, 1, 0, -totalFy],
                [0, 0, 1, -totalMomentAboutSupport]
            ];

            const reactions = this.gaussJordan(augmentedMatrix);

            fixedSupport.allocateReactions({
                horizontalForce: reactions[0],
                verticalForce: reactions[1],
                moment: reactions[2],
            });

        } else if (beamType === 'SimpleBeam') {
            // Differentiate supports by their number of constraints
            const pinnedSupport = supports.find(s => s.getNumberOfConstraints() === 2);
            const rollerSupport = supports.find(s => s.getNumberOfConstraints() === 1);

            if (!pinnedSupport || !rollerSupport) {
                throw new Error("Simple beam must have one pinned and one roller support.");
            }

            const momentRefPoint = pinnedSupport.getPosition();
            let totalMomentAboutPinned = 0;
            for (const load of loads) {
                totalMomentAboutPinned += load.getEquivalentMomentAt(momentRefPoint);
            }

            const leverArm = rollerSupport.getPosition() - pinnedSupport.getPosition();
            if (leverArm === 0) {
                throw new Error("Supports cannot be at the same position.");
            }

            // Equations for a simple beam (unknowns: Pinned_h, Pinned_v, Roller_v):
            // 1*Rh_p + 0*Rv_p + 0*Rv_r = -totalFx
            // 0*Rh_p + 1*Rv_p + 1*Rv_r = -totalFy
            // 0*Rh_p + 0*Rv_p + leverArm*Rv_r = -totalMomentAboutPinned
            const augmentedMatrix = [
                [1, 0, 0, -totalFx],
                [0, 1, 1, -totalFy],
                [0, 0, leverArm, -totalMomentAboutPinned]
            ];

            const reactions = this.gaussJordan(augmentedMatrix);

            pinnedSupport.allocateReactions({
                horizontalForce: reactions[0],
                verticalForce: reactions[1]
            });
            rollerSupport.allocateReactions({
                verticalForce: reactions[2]
            });
        } else {
            throw new Error('Unsupported beam type for reaction calculation.');
        }
    }
}

export class StaticallyIndeterminateBeam implements BeamInterface {
    private readonly length: number;

    constructor(length: number) {
        this.length = length;
    }

    calculateReactions(supports: Support[], loads: Load[]): void {
    }

    generateBendingMomentAtPoint(position: number, supports: Support[], loads: Load[]): number {
        return 0;
    }

    generateShearForceAtPoint(position: number, supports: Support[], loads: Load[]): number {
        return 0;
    }

    getLength(): number {
        return 0;
    }

}
