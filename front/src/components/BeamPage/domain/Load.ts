// /**
//  * Load와 동등한 효과를 가지는 Point load를 반환한다.
//  */
// export type EquivalentForce = {
//     /**
//      * positive number: downward
//      *
//      * negative number: upward
//      */
//     magnitude: number;
//     position: number;
// }

export type PointLoadInfo = {
    magnitude: number;
    position: number;
};

export type DistributedLoadInfo = {
    startMagnitude: number;
    endMagnitude: number;
    startPosition: number;
    endPosition: number;
}

export interface Load {
    getEquivalentForce: () => number;
    getEquivalentMomentAt: (position: number) => number;
    getPosition?: () => number;
}

export interface AngledLoad extends Load {
    getHorizontalForce: () => number;
}

export class PointLoad implements Load {
    private readonly magnitude: number;
    private readonly position: number;
    constructor(magnitude: number, position: number) {
        this.magnitude = magnitude;
        this.position = position;
    }

    public getEquivalentForce() {
        return this.magnitude;
    }
    public getEquivalentMomentAt(position: number): number {
        return this.magnitude * (this.position - position);
    }
    public getPosition(): number {
        return this.position;
    }
    public getMagnitude(): number {
        return this.magnitude;
    }
}

export class AngledPointLoad implements AngledLoad {
    private readonly magnitude: number;
    private readonly position: number;
    private readonly angle: number;
    constructor(magnitude: number, position: number, angle: number) {
        this.magnitude = magnitude;
        this.position = position;
        this.angle = angle;
    }

    public getEquivalentForce() {
        return this.magnitude * Math.sin(this.angle);
    }

    public getEquivalentMomentAt(position: number): number {
        return this.magnitude * Math.sin(this.angle) * (this.position - position);
    }

    public getHorizontalForce(): number {
        return this.magnitude * Math.cos(this.angle);
    }
}

/**
 * @constructing
 */
export class DistributedLoad implements Load {
    private startPosition: number = 0;
    private endPosition: number = 0;
    private startMagnitude: number = 0;
    private endMagnitude: number = 0;

    private constructor() {
    }

    public static createUniform(magnitude: number, startPosition: number, endPosition: number): DistributedLoad {
        return this.create(magnitude, magnitude, startPosition, endPosition);
    }
    public static create(startMagnitude: number, endMagnitude: number, startPosition: number, endPosition: number): DistributedLoad {
        const result = new DistributedLoad();
        result.startMagnitude = startMagnitude;
        result.endMagnitude = endMagnitude;
        result.startPosition = startPosition;
        result.endPosition = endPosition;
        return result;
    }
    
    public getStartPosition(): number {
        return this.startPosition;
    }
    
    public getEndPosition(): number {
        return this.endPosition;
    }
    
    public getStartMagnitude(): number {
        return this.startMagnitude;
    }
    
    public getEndMagnitude(): number {
        return this.endMagnitude;
    }

    public getEquivalentForce() {
        // For a trapezoidal load, the total force is the average magnitude times the length
        const averageMagnitude = (this.startMagnitude + this.endMagnitude) / 2;
        const length = this.endPosition - this.startPosition;
        return averageMagnitude * length;
    }

    public getEquivalentMomentAt(positionedAt: number): number {
        // For a distributed load, we need to calculate the moment about the given position
        // The equivalent force acts at the centroid of the distributed load

        // Calculate the total force
        const totalForce = this.getEquivalentForce();

        // Calculate the position of the centroid (center of gravity)
        let centroidPosition;

        if (this.startMagnitude === this.endMagnitude) {
            // For a uniform load, the centroid is at the middle
            centroidPosition = (this.startPosition + this.endPosition) / 2;
        } else {
            // For a trapezoidal load, the centroid is given by the formula:
            // x_c = x_1 + (x_2 - x_1) * (2*w_1 + w_2) / (3 * (w_1 + w_2))
            // where x_1, x_2 are the start and end positions, and w_1, w_2 are the start and end magnitudes
            centroidPosition = this.startPosition + 
                (this.endPosition - this.startPosition) * 
                (2 * this.startMagnitude + this.endMagnitude) / 
                (3 * (this.startMagnitude + this.endMagnitude));
        }

        // Calculate the moment about the given position
        // Moment = Force * Distance
        return totalForce * (centroidPosition - positionedAt);
    }
}
