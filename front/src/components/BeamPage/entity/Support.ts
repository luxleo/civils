import type {Support} from "./Beam.ts";
import {Support} from "./Beam.ts";

export interface Support {
    position: number;
    getPosition: () => number;
}

export class PinnedSupport implements Support {
    private readonly position: number;
    constructor(position: number) {
        if(position < 0) throw new Error("위치는 양수로 해주세요");
    }
    getPosition(): number {
        return 0;
    }
}
export class FixedSupport implements Support {
    private readonly position: number;
    constructor(position: number) {
        if(position < 0) throw new Error("위치는 양수로 해주세요");
    }
    getPosition(): number {
        return 0;
    }
}
export class RollerSupport implements Support {
    private readonly position: number;
    constructor(position: number) {
        if(position < 0) throw new Error("위치는 양수로 해주세요");
    }
    getPosition(): number {
        return 0;
    }
}