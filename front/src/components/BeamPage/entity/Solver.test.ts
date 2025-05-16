import { expect, test, describe } from "vitest";
import { Beam } from "./Beam";
import { PinnedSupport, RollerSupport, FixedSupport } from "./Support";
import { PointLoad, DistributedLoad, MomentLoad } from "./Load";
import { Solver } from "./Solver";

describe("Solver 클래스 테스트", () => {
    // 외팔보(캔틸레버) 테스트
    test("캔틸레버 보에 대한 반력 계산", () => {
        // 외팔보 생성 (길이 5m)
        const beam = new Beam(5);
        
        // 왼쪽 끝에 고정 지지점 추가
        const fixedSupport = new FixedSupport(0);
        beam.addSupport(fixedSupport);
        
        // 자유단(오른쪽 끝)에 10kN 집중하중 추가
        const load = new PointLoad(5, 10);
        beam.addLoad(load);
        
        // 구조 해석기 생성
        const solver = new Solver(beam);
        
        // 정정 구조 확인
        expect(solver.checkStaticDeterminacy()).toBe(true);
        
        // 반력 계산
        solver.solveReactions();
        
        // 수직 반력 검증 (전체 하중과 동일)
        expect(fixedSupport.getReactionForceY()).toBeCloseTo(10);
        
        // 모멘트 반력 검증 (P*L = 10kN * 5m = 50kN·m)
        expect(fixedSupport.getReactionMoment()).toBeCloseTo(50);
        
        // 전단력 검증 (고정단에서 자유단 방향으로 10kN)
        expect(solver.calculateShearForce(0.1)).toBeCloseTo(10);
        
        // 휨모멘트 검증 (위치 x에서 M = P*(L-x))
        expect(solver.calculateBendingMoment(1)).toBeCloseTo(60); // M = 10*(5-1) = 40kN·m
        expect(solver.calculateBendingMoment(3)).toBeCloseTo(80); // M = 10*(5-3) = 20kN·m
    });
    
    test("캔틸레버 보에 분포하중 적용", () => {
        // 외팔보 생성 (길이 4m)
        const beam = new Beam(4);
        
        // 왼쪽 끝에 고정 지지점 추가
        const fixedSupport = new FixedSupport(0);
        beam.addSupport(fixedSupport);
        
        // 전체 길이에 균일 분포하중 5kN/m 적용
        const distributedLoad = new DistributedLoad(0, 4, 5);
        beam.addLoad(distributedLoad);
        
        // 구조 해석기 생성
        const solver = new Solver(beam);
        
        // 반력 계산
        solver.solveReactions();
        
        // 수직 반력 검증 (w*L = 5kN/m * 4m = 20kN)
        expect(fixedSupport.getReactionForceY()).toBeCloseTo(20);
        
        // 모멘트 반력 검증 (w*L²/2 = 5kN/m * 4m² / 2 = 40kN·m)
        expect(fixedSupport.getReactionMoment()).toBeCloseTo(40);
        
        // 전단력 검증 (위치 x에서 V = w*(L-x))
        expect(solver.calculateShearForce(1)).toBeCloseTo(15); // V = 5*(4-1) = 15kN
        
        // 휨모멘트 검증 (위치 x에서 M = w*(L-x)²/2)
        expect(solver.calculateBendingMoment(1)).toBeCloseTo(22.5); // M = 5*(4-1)²/2 = 22.5kN·m
    });
    
    // 단순보 테스트
    test("단순보에 대한 반력 계산", () => {
        // 단순보 생성 (길이 10m)
        const beam = new Beam(10);
        
        // 지지점 추가 (왼쪽 끝에 핀, 오른쪽 끝에 롤러)
        const leftSupport = new PinnedSupport(0);
        const rightSupport = new RollerSupport(10);
        beam.addSupport(leftSupport);
        beam.addSupport(rightSupport);
        
        // 중앙에 20kN 집중하중 추가
        const load = new PointLoad(5, 20);
        beam.addLoad(load);
        
        // 구조 해석기 생성
        const solver = new Solver(beam);
        
        // 정정 구조 확인
        expect(solver.checkStaticDeterminacy()).toBe(true);
        
        // 반력 계산
        solver.solveReactions();
        
        // 왼쪽 지지점 반력 검증 (대칭 구조이므로 하중의 절반)
        expect(leftSupport.getReactionForceY()).toBeCloseTo(10);
        
        // 오른쪽 지지점 반력 검증 (대칭 구조이므로 하중의 절반)
        expect(rightSupport.getReactionForceY()).toBeCloseTo(10);
        
        // 전단력 검증
        expect(solver.calculateShearForce(2)).toBeCloseTo(10); // 왼쪽 지지점부터 하중 위치까지는 일정
        expect(solver.calculateShearForce(8)).toBeCloseTo(-10); // 하중 위치부터 오른쪽 지지점까지는 일정하고 부호 반대
        
        // 휨모멘트 검증
        // 중앙에서 최대 휨모멘트 (PL/4 = 20kN * 10m / 4 = 50kN·m)
        expect(solver.calculateBendingMoment(5)).toBeCloseTo(50);
        
        // 왼쪽 지지점부터 x 위치에서 휨모멘트 (Rx - wx²/2)
        expect(solver.calculateBendingMoment(2.5)).toBeCloseTo(25); // M = 10 * 2.5 = 25kN·m
    });
    
    test("단순보에 분포하중 적용", () => {
        // 단순보 생성 (길이 8m)
        const beam = new Beam(8);
        
        // 지지점 추가
        const leftSupport = new PinnedSupport(0);
        const rightSupport = new RollerSupport(8);
        beam.addSupport(leftSupport);
        beam.addSupport(rightSupport);
        
        // 전체 길이에 균일 분포하중 4kN/m 적용
        const distributedLoad = new DistributedLoad(0, 8, 4);
        beam.addLoad(distributedLoad);
        
        // 구조 해석기 생성
        const solver = new Solver(beam);
        
        // 반력 계산
        solver.solveReactions();
        
        // 양쪽 지지점 반력 검증 (w*L/2 = 4kN/m * 8m / 2 = 16kN)
        expect(leftSupport.getReactionForceY()).toBeCloseTo(16);
        expect(rightSupport.getReactionForceY()).toBeCloseTo(16);
        
        // 최대 휨모멘트 검증 (보 중앙, wL²/8 = 4kN/m * 8m² / 8 = 32kN·m)
        expect(solver.calculateBendingMoment(4)).toBeCloseTo(32);
    });
    
    test("모멘트 하중이 있는 단순보", () => {
        // 단순보 생성 (길이 6m)
        const beam = new Beam(6);
        
        // 지지점 추가
        const leftSupport = new PinnedSupport(0);
        const rightSupport = new RollerSupport(6);
        beam.addSupport(leftSupport);
        beam.addSupport(rightSupport);
        
        // 보 중앙에 30kN·m 모멘트 하중 적용
        const momentLoad = new MomentLoad(3, 30);
        beam.addLoad(momentLoad);
        
        // 구조 해석기 생성
        const solver = new Solver(beam);
        
        // 반력 계산
        solver.solveReactions();
        
        // 양쪽 지지점 반력 검증 (모멘트 하중에 의해 반대 방향으로 동일한 크기의 반력 발생)
        // 반력 = M/L = 30kN·m / 6m = 5kN
        expect(leftSupport.getReactionForceY()).toBeCloseTo(5);
        expect(rightSupport.getReactionForceY()).toBeCloseTo(-5);
    });
    
    // 전단력도, 휨모멘트도 생성 테스트
    test("전단력도와 휨모멘트도 생성", () => {
        // 단순보 생성 (길이 10m)
        const beam = new Beam(10);
        
        // 지지점 추가
        const leftSupport = new PinnedSupport(0);
        const rightSupport = new RollerSupport(10);
        beam.addSupport(leftSupport);
        beam.addSupport(rightSupport);
        
        // 중앙에 15kN 집중하중 추가
        const load = new PointLoad(5, 15);
        beam.addLoad(load);
        
        // 구조 해석기 생성
        const solver = new Solver(beam);
        
        // 반력 계산
        solver.solveReactions();
        
        // 전단력도 생성 (10개 포인트만 확인)
        const shearForceData = solver.generateShearForceDistribution(10);
        
        // 전단력도 데이터 검증
        expect(shearForceData.length).toBe(11); // 11개 포인트 (0부터 10까지)
        expect(shearForceData[0].x).toBeCloseTo(0); // 첫 지점은 x=0
        expect(shearForceData[10].x).toBeCloseTo(10); // 마지막 지점은 x=10
        
        // 하중 전후의 전단력 부호 변화 확인
        const midPointIndex = Math.floor(shearForceData.length / 2);
        expect(shearForceData[midPointIndex - 1].y).toBeGreaterThan(0); // 하중 전 양수
        expect(shearForceData[midPointIndex + 1].y).toBeLessThan(0); // 하중 후 음수
        
        // 휨모멘트도 생성
        const bendingMomentData = solver.generateBendingMomentDistribution(10);
        
        // 휨모멘트도 데이터 검증
        expect(bendingMomentData.length).toBe(11);
        
        // 중앙에서 최대 휨모멘트 확인 (PL/4 = 15kN * 10m / 4 = 37.5kN·m)
        const maxMoment = Math.max(...bendingMomentData.map(point => point.y));
        expect(maxMoment).toBeCloseTo(37.5);
    });
});
