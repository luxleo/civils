import {BeamContext} from "@/contexts";
import {FixedSupport, PinnedSupport, RollerSupport, Support} from "@/pages/BeamPage/domain_temp/Support";
import {Load, PointLoad} from "@/pages/BeamPage/domain_temp/Load";
import {BeamSolver} from "@/pages/BeamPage/domain_temp/Solver";
import {it, expect, describe} from "vitest";

describe('BeamSolver for Statically Determined Beams', () => {

    const beamContext: BeamContext = {length: 10};

    describe('Cantilever Beam', () => {
        const supports: Support[] = [new FixedSupport(0)];

        it('should solve reactions for a single point load', () => {
            // 10m cantilever, fixed at 0. 20kN downward load at 10m.
            const loads: Load[] = [new PointLoad(20, 10, 'downward')];
            const solver = new BeamSolver(beamContext, loads, supports);
            const reactions = solver.calculateReactions();

            const supportReactions = reactions[0];
            expect(supportReactions).toBeDefined();
            // Upward vertical reaction
            expect(supportReactions.verticalForce).toBeCloseTo(20);
            // No horizontal load
            expect(supportReactions.horizontalForce).toBeCloseTo(0);
            // Counter-clockwise moment reaction
            expect(supportReactions.moment).toBeCloseTo(200);
        });

        // it('should solve reactions for a uniformly distributed load', () => {
        //     // 10m cantilever, fixed at 0. 5kN/m UDL over the whole length.
        //     const loads: Load[] = [new DistributedLoad(0, 10, -5, -5)];
        //     const solver = new BeamSolver(beamContext, loads, supports);
        //     const reactions = solver.calculateReactions();
        //
        //     const supportReactions = reactions[0];
        //     expect(supportReactions).toBeDefined();
        //     // Total load = 50kN. Upward reaction = 50kN
        //     expect(supportReactions.verticalForce).toBeCloseTo(50);
        //     expect(supportReactions.horizontalForce).toBeCloseTo(0);
        //     // Moment = 50kN * 5m (centroid). Counter-clockwise reaction = 250kNm.
        //     expect(supportReactions.moment).toBeCloseTo(250);
        // });
        //
        // it('should solve reactions for an angled point load', () => {
        //     // Load at 5m. Vertical: -10kN (down). Horizontal: +30kN (right).
        //     const loads: Load[] = [new AngledPointLoad(5, -10, 30)];
        //     const solver = new BeamSolver(beamContext, loads, supports);
        //     const reactions = solver.calculateReactions();
        //
        //     const supportReactions = reactions[0];
        //     expect(supportReactions).toBeDefined();
        //     // Upward vertical reaction
        //     expect(supportReactions.verticalForce).toBeCloseTo(10);
        //     // Leftward horizontal reaction
        //     expect(supportReactions.horizontalForce).toBeCloseTo(-30);
        //     // Counter-clockwise moment from vertical load
        //     expect(supportReactions.moment).toBeCloseTo(50);
        // });
    });

    describe('Simple Beam', () => {
        it('should solve reactions for a centered point load', () => {
            // 10m simple beam, pinned at 0, roller at 10. 50kN load at 5m.
            const supports: Support[] = [new PinnedSupport(0), new RollerSupport(10)];
            const loads: Load[] = [new PointLoad(50, 5, 'downward')];
            const solver = new BeamSolver(beamContext, loads, supports);
            const reactions = solver.calculateReactions();

            const pinnedReactions = reactions[0];
            const rollerReactions = reactions[10];

            expect(pinnedReactions).toBeDefined();
            expect(rollerReactions).toBeDefined();

            // Symmetrical loading, reactions are equal.
            expect(pinnedReactions.verticalForce).toBeCloseTo(25);
            expect(pinnedReactions.horizontalForce).toBeCloseTo(0);
            expect(rollerReactions.verticalForce).toBeCloseTo(25);
        });

        it('should solve reactions for an off-center point load', () => {
            // 10m simple beam, pinned at 0, roller at 10. 100kN load at 2m.
            const supports: Support[] = [new PinnedSupport(0), new RollerSupport(10)];
            const loads: Load[] = [new PointLoad(100, 2, 'downward')];
            const solver = new BeamSolver(beamContext, loads, supports);
            const reactions = solver.calculateReactions();

            const pinnedReactions = reactions[0];
            const rollerReactions = reactions[10];

            // Moment about pinned support: R_roller * 10 - 100 * 2 = 0 => R_roller = 20.
            expect(rollerReactions.verticalForce).toBeCloseTo(20);
            // Sum of vertical forces: R_pinned + 20 - 100 = 0 => R_pinned = 80.
            expect(pinnedReactions.verticalForce).toBeCloseTo(80);
            expect(pinnedReactions.horizontalForce).toBeCloseTo(0);
        });

        it('should solve reactions when roller support is before pinned support', () => {
            // 10m beam, roller at 0, pinned at 10. 100kN load at 2m.
            const supports: Support[] = [new RollerSupport(0), new PinnedSupport(10)];
            const loads: Load[] = [new PointLoad(100, 2, 'downward')];
            const solver = new BeamSolver(beamContext, loads, supports);
            const reactions = solver.calculateReactions();

            const rollerReactions = reactions[0];
            const pinnedReactions = reactions[10];

            // Moment about pinned (at 10): R_roller * (-10) - 100 * (2-10) = 0 => R_roller = 80
            expect(rollerReactions.verticalForce).toBeCloseTo(80);
            // Sum Fy: 80 + R_pinned - 100 = 0 => R_pinned = 20
            expect(pinnedReactions.verticalForce).toBeCloseTo(20);
            expect(pinnedReactions.horizontalForce).toBeCloseTo(0);
        });

        // it('should solve reactions for combined UDL and angled load', () => {
        //     const supports: Support[] = [new PinnedSupport(0), new RollerSupport(10)];
        //     const loads: Load[] = [
        //         new DistributedLoad(0, 10, -10, -10),      // 10kN/m UDL
        //         new AngledPointLoad(7, -20, 40) // Vert:-20, Horiz:+40
        //     ];
        //     const solver = new BeamSolver(beamContext, loads, supports);
        //     const reactions = solver.calculateReactions();
        //
        //     const pinnedReactions = reactions[0];
        //     const rollerReactions = reactions[10];
        //
        //     // Total vertical load = 100 (UDL) + 20 = 120. Total horizontal = 40.
        //     // Moment about pinned(0): (-100*5) + (-20*7) + R_roller*10 = 0 => -640 + 10*R_roller = 0 => R_roller = 64
        //     expect(rollerReactions.verticalForce).toBeCloseTo(64);
        //     // Sum Fy: R_pinned_v + 64 - 120 = 0 => R_pinned_v = 56
        //     expect(pinnedReactions.verticalForce).toBeCloseTo(56);
        //     // Sum Fx: R_pinned_h + 40 = 0 => R_pinned_h = -40
        //     expect(pinnedReactions.horizontalForce).toBeCloseTo(-40);
        // });
    });
});
