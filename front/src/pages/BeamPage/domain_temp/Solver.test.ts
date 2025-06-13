import {describe, it, expect, vi} from 'vitest';
import {BeamSolver} from './Solver';
import {BeamInterface} from '@/pages/BeamPage/domain_temp/Beam';
import {PointLoadImpl} from './Load';
import {PinnedSupport, RollerSupport} from './Support';

describe('BeamSolver', () => {
    it('should solve reactions as soon as the object is created', () => {
        // Arrange
        // Create a spy on the calculateReactions method of StaticallyDeterminedBeam
        const calculateReactionsSpy = vi.spyOn(Beam.prototype, 'calculateReactions');

        // Create test data
        const beam = new Beam(10); // 10 units length
        const loads = [new PointLoadImpl(100, 5)]; // 100 units force at position 5
        const supports = [
            new PinnedSupport(0), // Support at position 0
            new RollerSupport(10) // Support at position 10
        ];

        // Act
        // Just creating the BeamSolver instance should trigger the solve method
        new BeamSolver(beam, loads, supports);

        // Assert
        // Verify that calculateReactions was called during instantiation
        expect(calculateReactionsSpy).toHaveBeenCalledTimes(1);
        expect(calculateReactionsSpy).toHaveBeenCalledWith(supports, loads);

        // Clean up
        calculateReactionsSpy.mockRestore();
    });
});
