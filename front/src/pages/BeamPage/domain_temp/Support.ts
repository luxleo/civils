export const ConstraintKeys = {
    HORIZONTAL_TRANSLATION: 'horizontalTranslation',
    VERTICAL_TRANSLATION: 'verticalTranslation',
    ROTATION: 'rotation'
} as const;

export type Constraint = typeof ConstraintKeys[keyof typeof ConstraintKeys];

export interface Support {
    getPosition(): number;

    calculateMomentAtPoint(pointAt: number): number;

    /**
     * Calculates the reaction forces at this support
     * @returns An object containing the reaction forces
     * @param reactionForces
     */
    allocateReactions(reactionForces: ReactionForces): void;

    /**
     * Gets the degrees of freedom constrained by this support
     * @returns Array of constrained degrees of freedom-
     */
    getNumberOfConstraints(): 1 | 2 | 3;

    getVerticalForce(): number;

    getHorizontalForce?(): number;

    getMoment?(): number;

    /**
     * 단면법으로 전단력 계산한다.
     * 단면의 진행 방향은 왼 -> 오 이다.
     * @param position
     */
    calculateShearForceAt(position: number): number;
}

export interface ReactionForces {
    verticalForce: number;
    horizontalForce?: number;
    moment?: number;
}

abstract class AbstractSupport {
    protected readonly position: number;
    protected reactionForces: ReactionForces = {
        horizontalForce: 0,
        verticalForce: 0,
        moment: 0
    };

    protected constructor(position: number) {
        this.position = position;
    }

    calculateShearForceAt(position: number): number {
        if (position < this.position) {
            return this.reactionForces.verticalForce;
        }
        return 0;
    }
}

export class FixedSupport extends AbstractSupport implements Support {
    private readonly constraints: Constraint[] = ['horizontalTranslation', 'verticalTranslation', 'rotation'];

    constructor(position: number) {
        super(position);
    }

    calculateMomentAtPoint(pointAt: number): number {
        let bendingMoment = 0;
        if (this.position <= pointAt) {
            // 수직 반력에 의한 모멘트 계산
            bendingMoment += this.reactionForces.verticalForce * (pointAt - this.position);
            bendingMoment += this.reactionForces.moment as number;
        }
        return bendingMoment;
    }

    getPosition(): number {
        return this.position;
    }

    allocateReactions(reactionForces: ReactionForces) {
        this.reactionForces = {...reactionForces};
    }

    getNumberOfConstraints(): 1 | 2 | 3 {
        return 3;
    }

    getHorizontalForce(): number {
        return this.reactionForces.horizontalForce as number;
    }

    getVerticalForce(): number {
        return this.reactionForces.verticalForce;
    }

    getMoment(): number {
        return this.reactionForces.moment as number;
    }
}

export class PinnedSupport extends AbstractSupport implements Support {
    private readonly constraints: Constraint[] = ['horizontalTranslation', 'verticalTranslation'];

    constructor(position: number) {
        super(position);
    }

    getMoment?(): number {
        throw new Error("Method not implemented.");
    }

    calculateMomentAtPoint(pointAt: number): number {
        let bendingMoment = 0;
        if (this.position <= pointAt) {
            // 수직 반력에 의한 모멘트 계산
            bendingMoment += this.reactionForces.verticalForce * (pointAt - this.position);
        }
        return bendingMoment;
    }

    getPosition(): number {
        return this.position;
    }

    allocateReactions(reactionForces: ReactionForces) {
        this.reactionForces = {
            ...reactionForces
        };
    }

    getNumberOfConstraints(): 1 | 2 | 3 {
        return 2;
    }

    getHorizontalForce(): number {
        return this.reactionForces.horizontalForce as number;
    }

    getVerticalForce(): number {
        return this.reactionForces.verticalForce;
    }
}

export class RollerSupport extends AbstractSupport implements Support {
    private readonly constraints: Constraint[] = ['horizontalTranslation'];

    constructor(position: number) {
        super(position);
    }

    calculateMomentAtPoint(pointAt: number): number {
        let bendingMoment = 0;
        if (this.position <= pointAt) {
            // 수직 반력에 의한 모멘트 계산
            bendingMoment += this.reactionForces.verticalForce * (pointAt - this.position);
        }
        return bendingMoment;
    }

    getPosition(): number {
        return this.position;
    }

    allocateReactions(reactionForces: ReactionForces) {
        this.reactionForces = {
            ...reactionForces
        };
    }

    getNumberOfConstraints(): 1 | 2 | 3 {
        return 1;
    }

    getVerticalForce(): number {
        return this.reactionForces.verticalForce;
    }
}
