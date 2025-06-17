import type {LoadDirection} from "@/contexts/BeamProvider";

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
    calculateShearForce(): number;

    getMomentAt(position: number): number;

    getShearForceAt(position: number): number;
}

export interface AngledPointLoad extends Load {
    calculateHorizontalForce(): number;
}

export interface DistributedLoad extends Load {
    getEquivalentForce: () => number;
}

abstract class AbstractLoad implements Load {
    protected abstract isApplicableAt(position: number): boolean;
}

//TODO: abstract class
export class PointLoad extends AbstractLoad implements Load {
    private readonly magnitude: number;
    private readonly position: number;
    private readonly direction: LoadDirection;

    constructor(magnitude: number, position: number, direction: LoadDirection) {
        super();
        this.magnitude = magnitude;
        this.position = position;
        this.direction = direction;
    }

    protected isApplicableAt(position: number): boolean {
        return position <= this.position;
    }

    getShearForceAt(position: number): number {
        if (this.isApplicableAt(position)) {
            return this.calculateShearForce();
        }
        return 0;
    }

    getMomentAt(position: number): number {
        if (this.isApplicableAt(position)) {
            return this.calculateShearForce() * (this.position - position);
        }
        return 0;
    }

    public calculateShearForce() {
        if (this.direction === 'upward') {
            return this.magnitude;
        }
        return -this.magnitude;
    }
}

//TODO: direction 을 정하지 않고 각도로 위 아래 계산하기.
export class AngledPointLoadImpl extends AbstractLoad implements AngledPointLoad {
    private readonly magnitude: number;
    private readonly position: number;
    private readonly angle: number;

    constructor(magnitude: number, position: number, angle: number) {
        super();
        this.magnitude = magnitude;
        this.position = position;
        this.angle = angle;
    }

    protected isApplicableAt(position: number): boolean {
        return position <= this.position;
    }

    public calculateShearForce() {
        return this.magnitude * Math.sin(this.angle);
    }

    getMomentAt(position: number): number {
        if (this.isApplicableAt(position)) {
            return this.magnitude * Math.sin(this.angle) * (this.position - position);
        }
        return 0;
    }

    getShearForceAt(position: number): number {
        if (this.isApplicableAt(position)) {
            return this.calculateShearForce();
        }
        return 0;
    }

    public calculateHorizontalForce(): number {
        return this.magnitude * Math.cos(this.angle);
    }
}

/**
 * @constructing
 */
export class DistributedLoadImpl implements DistributedLoad {
    private readonly startPosition: number = 0;
    private readonly endPosition: number = 0;
    private readonly startMagnitude: number = 0;
    private readonly endMagnitude: number = 0;
    private readonly direction: LoadDirection;

    private constructor(startPosition: number, endPosition: number, startMagnitude: number, endMagnitude: number, direction: LoadDirection) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.startMagnitude = startMagnitude;
        this.endMagnitude = endMagnitude;
        this.direction = direction;
    }

    getEquivalentForce: () => number;

    public static createUniform(magnitude: number, startPosition: number, endPosition: number, direction: LoadDirection): DistributedLoadImpl {
        return this.create(magnitude, magnitude, startPosition, endPosition, direction);
    }

    public static create(startMagnitude: number, endMagnitude: number, startPosition: number, endPosition: number, direction: LoadDirection): DistributedLoadImpl {
        return new DistributedLoadImpl(startPosition, endPosition, startMagnitude, endMagnitude, direction);
    }

    public calculateShearForce(): number {
        const averageMagnitude = (this.startMagnitude + this.endMagnitude) / 2;
        const length = this.endPosition - this.startPosition;
        const magnitude = averageMagnitude * length;
        if (this.direction === 'upward') {
            return magnitude;
        }
        return -magnitude;
    }

    getShearForceAt(position: number): number {
        // 위치가 분포하중 구간 내에 있는 경우
        if (position >= this.startPosition && position <= this.endPosition) {
            // 해당 구간의 다항식을 사용하여 전단력 계산
            // 선형 다항식: w(x) = w1 + (w2-w1)*(x-x1)/(x2-x1)

            // x 위치에서의 분포하중 크기
            const wx =
                this.startMagnitude +
                (this.endMagnitude - this.startMagnitude) * (position - this.startPosition)
                / (this.endPosition - this.startPosition);

            // 분포하중 구간 시작부터 x 위치까지의 총 하중 계산 (다항식의 적분)
            // 적분: ∫[w1 + (w2-w1)*(t-x1)/(x2-x1)] dt, from t=x1 to t=x
            const partialLength = position - this.startPosition;
            const averageLoad = (this.startMagnitude + wx) / 2;
            return averageLoad * partialLength;
        }
        // 위치가 분포하중 구간 오른쪽에 있는 경우
        else if (position > this.endPosition) {
            // 전체 분포하중의 영향을 고려
            return this.calculateShearForce();
        }
        return 0;
    }

    getMomentAt(position: number): number {
        throw new Error("Method not implemented.");
    }

    public getEquivalentMomentAt(positionedAt: number): number {
        // For a distributed load, we need to calculate the moment about the given position
        // The equivalent force acts at the centroid of the distributed load

        // Calculate the total force
        const totalForce = this.calculateShearForce();

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
