import  {type PointLoad} from "./Beam.ts";

interface Renderer {
    calculateAtPoint(position: number, loads: PointLoad[]): ValueAtPoint;
    render(): ValueAtPoint[]; // TODO: determine whether beam is statically determined or not and call different calculate function
}

export interface ValueAtPoint {
    position: number;
    magnitude: number;
}
export type ShearForce = ValueAtPoint;
export type BendingMoment = ValueAtPoint;

export class SFDRenderer implements Renderer {
    render(): ValueAtPoint[] {
        return [];
    }
    // only call when beam is statically determined
    calculateAtPoint(position: number, loads: PointLoad[]): ValueAtPoint {
        let netForce = 0;
        for( const load of loads ) {
            if(position >= load.getPosition())
                netForce -= load.getMagnitude();
        }
        return {
            position,
            magnitude: netForce
        }
    }
}