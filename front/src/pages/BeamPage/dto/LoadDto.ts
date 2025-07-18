import type {DirectionType, DistributedLoadContext, PointLoadContext} from "@/contexts/LoadElementProvider";

export class PointLoadDto implements PointLoadContext {
    direction: DirectionType;
    magnitude: number;
    position: number;

    constructor(magnitude: number, position: number, direction: DirectionType) {
        this.magnitude = magnitude;
        this.position = position;
        this.direction = direction;
    }

    // Static factory method for easier creation from form data
    static fromFormData(data: {
        magnitude: number;
        position: number;
        direction: 'UP' | 'DOWN';
    }): PointLoadDto {
        return new PointLoadDto(data.magnitude, data.position, data.direction);
    }
}

export class DistributedLoadDto implements DistributedLoadContext {
    direction: DirectionType;
    startMagnitude: number;
    endMagnitude: number;
    startPosition: number;
    endPosition: number;

    constructor(
        direction: DirectionType,
        startMagnitude: number,
        endMagnitude: number,
        startPosition: number,
        endPosition: number
    ) {
        this.direction = direction;
        this.startMagnitude = startMagnitude;
        this.endMagnitude = endMagnitude;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
    }
}
