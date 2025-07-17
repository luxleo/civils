import {BeamInterface, BeamSolver} from "src/pages/BeamPage/domain_temp";

export class BeamFacade {
    private beam: BeamInterface;
    private solver: BeamSolver;

    constructor(beam: BeamInterface) {
        this.beam = beam;
        this.solver = new BeamSolver(beam);
    }

    /**
     * Solves the beam problem by calculating the reactions at the supports
     */
    public solve(): void {
        this.solver.solve();
    }

    /**
     * Gets the type of the beam problem (statically determined or indeterminate)
     * @returns The problem type: "SDB" for statically determined beam or "SIB" for statically indeterminate beam
     */
    public getProblemType(): "SDB" | "SIB" {
        return this.solver.getProblemType(this.beam);
    }
}
