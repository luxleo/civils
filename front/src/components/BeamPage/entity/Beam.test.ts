import {expect, test} from "vitest";
import {Beam} from "./Beam.ts";

test("beam invalid length test", () => {
    const beam = new Beam(10);
    expect(beam.changeLength(-1))
        .toThrowError("길이는 양수로 해주세요");
})