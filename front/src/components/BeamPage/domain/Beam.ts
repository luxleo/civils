import {FixedSupport, type ReactionForces, type Support} from "./Support.ts";
import type {Load, AngledLoad} from "./Load.ts";

export interface Beam {
    calculateReactions(): void;
    getSupports(): Support[];
    getLength(): number;
    getLoads(): Load[];
}

export class StaticallyDeterminedBeam implements Beam {
    private length: number;
    private loads: Load[];
    private supports: Support[];

    constructor(length: number, loads: Load[], supports: Support[]) {
        this.length = length;
        this.loads = loads;
        this.supports = supports;
    }

    public getSupports(): Support[] {
        return this.supports;
    }
    
    public getLength(): number {
        return this.length;
    }
    
    public getLoads(): Load[] {
        return this.loads;
    }
    
    public calculateReactions() {
        if(this.determineBeamType() === 'CantileverBeam') {
            this.calculateCantileverBeamReactions();
        } else {
            this.calculateSimpleBeamReactions();
        }
    }

    private determineBeamType() : 'CantileverBeam' | 'SimpleBeam' {
        if (this.supports.length === 1 && this.supports[0] instanceof FixedSupport) {
            return 'CantileverBeam';
        } else if (this.supports.length === 2) {
            return 'SimpleBeam';
        } else {
            throw new Error('Beam type not supported');
        }
    }

    /**
     * solve cantilever's unknown reactions using equilibrium equation.
     * @private
     */
    private calculateCantileverBeamReactions() {
        const reactionForces: ReactionForces = {
            verticalForce: 0,
            horizontalForce: 0,
            moment: 0
        };
        const support = this.supports[0] as FixedSupport;

        for (const load of this.loads) {
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

    private calculateSimpleBeamReactions() {
        // For a simple beam with two supports, we need to solve for the reaction forces
        // using the equilibrium equations: sum of forces = 0 and sum of moments = 0

        // Get the two supports
        if (this.supports.length !== 2) {
            throw new Error('Simple beam must have exactly two supports');
        }

        const support1 = this.supports[0];
        const support2 = this.supports[1];

        // Calculate the total vertical force from all loads
        let totalVerticalForce = 0;
        // Calculate the total moment about support1 from all loads
        let totalMomentAboutSupport1 = 0;

        for (const load of this.loads) {
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
