import type {Support} from "./Support.ts";

export class PointLoad {
    private readonly position: number;
    private readonly magnitude: number;
    constructor(position: number, magnitude: number) {
        if(position < 0) throw new Error(
            "위치는 양수로 해주세요"
        );
        this.position = position;
        this.magnitude = magnitude;
    }

    public getPosition() {
        return this.position;
    }
    public getMagnitude() {
        return this.magnitude;
    }
}

export class Beam {
    private readonly length: number;
    private supports: Record<number, Support> = {};
    private loads: Record<number, PointLoad> = {};

    constructor(length: number) {
        if(length < 0) throw new Error(
            "길이는 양수로 해주세요"
        );
        this.length = length;
    }

    public addSupport(support: Support) {
        if(support.getPosition() < 0 || support.getPosition() > this.length)
            throw new Error("지지대의 위치가 유효하지 않습니다.");
        if(Object.hasOwnProperty.call(this.supports, support.getPosition()))
            throw new Error("지지대가 이미 존재합니다.");
        this.supports[support.getPosition()] = support;
    }

    public addLoad(load: PointLoad) {
        if(load.getPosition() < 0 || load.getPosition() > this.length)
            throw new Error("지지대의 위치가 유효하지 않습니다.");
        this.loads[load.getPosition()] = load;
    }
    public getLength() {
        return this.length;
    }
    public getSupports() {
        return this.supports;
    }
    public getLoads() {
        return this.loads;
    }
    public changeLength(length: number) {
        if(length < 0) throw new Error(
            "길이는 양수로 해주세요"
        )
    }
}