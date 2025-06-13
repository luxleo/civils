import {
    BeamSolver,
    DistributedLoadImpl, FixedSupport,
    type Load,
    PinnedSupport,
    PointLoadImpl,
    type ReactionForces, RollerSupport,
    type Support
} from "@/pages/BeamPage/domain_temp";
import type {BendingMomentDiagram, ShearForceDiagram} from "@/pages/BeamPage/domain_temp/Solver";
import {BeamContext, type LoadContext, type SupportContext} from "@/contexts";

type BeamAnalyzeResponse = {
    /**
     * 보의 지지대의 모든 반력들을 반환한다.
     * Map<number, ReactionForces> 에서의 number는 position 이다.
     */
    reactions: Record<number, ReactionForces>
    sfd: ShearForceDiagram;
    bmd: BendingMomentDiagram;
}

export class BeamService {
    //TODO: initialize BeamSolver in constructor of BeamService
    //TODO: how to make method static

    static analyzeBeam(beamContext: BeamContext, loadContexts: LoadContext[], supportContexts: SupportContext[]): BeamAnalyzeResponse {
        const beamSolver = new BeamSolver(
            beamContext,
            BeamService.loadContextsToLoads(loadContexts),
            BeamService.supportContextsToSupports(supportContexts)
        );
        return {
            reactions: beamSolver.calculateReactions(),
            sfd: beamSolver.generateSFD(),
            bmd: beamSolver.generateBMD(),
        }
    }

    private static loadContextsToLoads(loadContexts: LoadContext[]): Load[] {
        const loads: Load[] = [];
        for (const loadContext of loadContexts) {
            const {type} = loadContext;
            switch (type) {
                case "pointLoad":
                    loads.push(new PointLoadImpl(loadContext.magnitude, loadContext.position));
                    break;
                case "distributedLoad": {
                    const {startMagnitude, endMagnitude, startPosition, endPosition} = loadContext;
                    loads.push(DistributedLoadImpl.create(startMagnitude, endMagnitude, startPosition, endPosition));
                    break;
                }
            }
        }
        return loads;
    }

    private static supportContextsToSupports(supportsContext: SupportContext[]): Support[] {
        const supports: Support[] = [];
        for (const supportContext of supportsContext) {
            const {type, position} = supportContext;
            switch (type) {
                case "fixed":
                    supports.push(new FixedSupport(position));
                    break;
                case "pinned":
                    supports.push(new PinnedSupport(position));
                    break;
                case "roller":
                    supports.push(new RollerSupport(position));
                    break;
            }
        }
        return supports;
    }
}