export const ConstraintKeys = {
    HORIZONTAL_TRANSLATION : 'horizontalTranslation',
    VERTICAL_TRANSLATION : 'verticalTranslation',
    ROTATION : 'rotation'
} as const;

export type Constraint = typeof ConstraintKeys[keyof typeof ConstraintKeys];

export interface Support {
    getPosition(): number;

    /**
     * Calculates the reaction forces at this support
     * @returns An object containing the reaction forces
     * @param reactionForces
     */
    allocateReactions(reactionForces : ReactionForces): void;

    /**
     * Gets the degrees of freedom constrained by this support
     * @returns Array of constrained degrees of freedom-
     */
    getNumberOfConstraints(): 1 | 2 | 3;
    getVerticalForce(): number;
    getHorizontalForce?(): number;
    getMoment?(): number;
}

export interface ReactionForces {
    verticalForce: number;
    horizontalForce?: number;
    moment?: number;
}

export class FixedSupport implements Support {
    private readonly position: number;
    private readonly constraints: Constraint[] = ['horizontalTranslation','verticalTranslation', 'rotation'];
    private reactionForces: ReactionForces = {
        horizontalForce: 0,
        verticalForce: 0,
        moment: 0
    };
    constructor(position: number) {
        this.position = position;
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

export class PinnedSupport implements Support {
    private readonly position: number;
    private readonly constraints: Constraint[] = ['horizontalTranslation','verticalTranslation'];
    private reactionForces: ReactionForces = {
        horizontalForce: 0,
        verticalForce: 0,
    };
    constructor(position: number) {
        this.position = position;
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

export class RollerSupport implements Support {
    private readonly position: number;
    private readonly constraints: Constraint[] = ['horizontalTranslation'];
    private reactionForces: ReactionForces = {
        verticalForce: 0,
    };
    constructor(position: number) {
        this.position = position;
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
