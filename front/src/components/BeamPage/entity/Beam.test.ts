import {expect, test} from "vitest";
import {Beam} from "./Beam.ts";
import {PinnedSupport, RollerSupport} from "./Support.ts";
import {PointLoad} from "./Load.ts";
import {StaticStructureSolver} from "./Solver.ts";

test("beam invalid length test", () => {
    const beam = new Beam(10);
    expect(() => beam.changeLength(-1))
        .toThrowError("길이는 양수로 해주세요");
})

test("simple beam with point load", () => {
    // 단순보 생성 (길이 10m)
    const beam = new Beam(10);
    
    // 지지점 추가 (왼쪽 끝에 핀, 오른쪽 끝에 롤러)
    const leftSupport = new PinnedSupport(0);
    const rightSupport = new RollerSupport(10);
    beam.addSupport(leftSupport);
    beam.addSupport(rightSupport);
    
    // 하중 추가 (중앙에 10kN 하중)
    const load = new PointLoad(5, 10);
    beam.addLoad(load);
    
    // 구조 해석기 생성
    const solver = new StaticStructureSolver(beam);
    
    // 반력 계산
    solver.solveReactions();
    
    // 간단한 단순보 계산: 양쪽 지지점 반력은 각각 하중의 절반
    expect(leftSupport.getReactionForceY()).toBeCloseTo(5);
    expect(rightSupport.getReactionForceY()).toBeCloseTo(5);
    
    // 보 중앙에서의 휨모멘트 (M = PL/4)
    expect(solver.calculateBendingMoment(5)).toBeCloseTo(25);
})

test("beam is statically determinate", () => {
    const beam = new Beam(10);
    
    // 정정 구조가 되기 위한 지지점 추가 (2차원 보의 경우, 일반적으로 3개의 반력 컴포넌트 필요)
    beam.addSupport(new PinnedSupport(0)); // 2개의 반력 컴포넌트 (Fx, Fy)
    beam.addSupport(new RollerSupport(10)); // 1개의 반력 컴포넌트 (Fy)
    
    expect(beam.isStaticallyDeterminate()).toBe(true);
})