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
        bendingMoment += supports.reduce((acc, support) => acc + support.calculateMomentAtPoint(position), 0);
        // 모든 하중에 의한 모멘트 고려
        bendingMoment += loads.reduce((acc, load) => acc + load.getMomentAt(position), 0);
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
        shearForce += supports.reduce((acc, support) => acc + support.calculateShearForceAt(position), 0);
        shearForce += loads.reduce((acc, load) => acc + load.getShearForceAt(position), 0);
        return shearForce;
    }

    private determineBeamType(supports: Support[]): 'CantileverBeam' | 'SimpleBeam' {
        if (this.isStaticallyDeterminedCantileverBeam(supports)) {
            return 'CantileverBeam';
        } else if (supports.length === 2 && supports.reduce((acc, support) => acc + support.getNumberOfConstraints(), 0) === 3) {
            return 'SimpleBeam';
        } else {
            throw new Error('Beam type not supported or is statically indeterminate.');
        }
    }

    //TODO: 정정구조물 판단 로직을 다음과 같이 수정: 고정단 둘 미만, 수평력 없을 시 지점수는 관계없음.
    private isStaticallyDeterminedCantileverBeam(supports: Support[]): boolean {
        return supports.length === 1 && supports[0].getNumberOfConstraints() === 3;
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
                        m[i][j] -= factor * m[h][j]; // eliminate all first colum that is not pivot row.
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
