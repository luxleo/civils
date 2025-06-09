import {type Beam, BeamSolver, type Load, type ReactionForces, type Support} from "@/pages/BeamPage/domain";
import {BendingMomentDiagram, ShearForceDiagram} from "@/pages/BeamPage/domain/Solver";

type BeamAnalyzeResponse = {
    /**
     * 보의 지지대의 모든 반력들을 반환한다.
     * Map<number, ReactionForces> 에서의 number는 position 이다.
     */
    // reactions: Map<number, ReactionForces>
    sfd: ShearForceDiagram;
    bmd: BendingMomentDiagram;
}

interface BeamService {
    analyzeBeam(beam: Beam, loads: Load[], supports: Support[]): BeamAnalyzeResponse;
}

export class BeamService implements BeamService {

    analyzeBeam(beam: Beam, loads: Load[], supports: Support[]): BeamAnalyzeResponse {
        const beamSolver = new BeamSolver(beam, loads, supports);
        return {
            sfd: beamSolver.generateSFD(),
            bmd: beamSolver.generateBMD(),
        }
    }
}