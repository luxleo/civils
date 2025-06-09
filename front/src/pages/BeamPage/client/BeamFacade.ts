import {Beam, BeamSolver} from "../domain";

export class BeamFacade {
    private beam: Beam;
    private solver: BeamSolver;

    constructor(beam: Beam) {
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
