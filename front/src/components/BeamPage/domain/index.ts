// Export all the necessary types and classes from the domain directory
// Export from Beam.ts
export {StaticallyDeterminedBeam} from './Beam';
export type { Beam } from './Beam';

// Export from Support.ts
export { 
    ConstraintKeys, 
    type Constraint, 
    type Support, 
    type ReactionForces, 
    FixedSupport, 
    PinnedSupport, 
    RollerSupport 
} from './Support';

// Export from Load.ts
export { 
    type PointLoadInfo, 
    type DistributedLoadInfo, 
    type Load, 
    type AngledLoad, 
    PointLoad, 
    AngledPointLoad, 
    DistributedLoad 
} from './Load';

// Export from Solver.ts
export { BeamSolver } from './Solver';