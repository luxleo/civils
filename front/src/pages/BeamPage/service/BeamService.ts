import {
    BeamSolver,
    FixedSupport,
    type Load,
    PinnedSupport,
    RollerSupport,
    type Support
} from "@/pages/BeamPage/domain_temp";
import type {BeamAnalyzeResponse} from "@/pages/BeamPage/domain_temp/Solver";
import type {BeamContextProps, LoadContext, SupportContext} from "@/contexts";

export class BeamService {
    //TODO: initialize BeamSolver in constructor of BeamService
    //TODO: how to make method static

    static analyzeBeam(beamContext: BeamContextProps, loadContexts: LoadContext[], supportContexts: SupportContext[]): BeamAnalyzeResponse {
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
        return loadContexts.map(loadContext => loadContext.toLoad());
    }

    private static supportContextsToSupports(supportsContext: SupportContext[]): Support[] {
        return supportsContext.map(supportContext => BeamService.toSupport(supportContext.type, supportContext.position));
    }

    private static toSupport(type: string, position: number): Support {
        switch (type) {
            case "fixed":
                return new FixedSupport(position);
            case "pinned":
                return new PinnedSupport(position);
            case "roller":
                return new RollerSupport(position);
            default:
                throw new Error("Invalid support type");
        }
    }
}
