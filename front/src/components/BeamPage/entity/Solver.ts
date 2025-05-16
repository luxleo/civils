import { Beam } from "./Beam.ts";
import {FixedSupport, type Support} from "./Support.ts";
import {DistributedLoad, type Load} from "./Load.ts";

export class Solver {
    private beam: Beam;
    
    constructor(beam: Beam) {
        this.beam = beam;
    }
    
    // 정정 구조 조건 확인
    checkStaticDeterminacy(): boolean {
        return this.beam.isStaticallyDeterminate();
    }
    
    // 반력 계산
    solveReactions(): void {
        if (!this.checkStaticDeterminacy()) {
            throw new Error("이 구조물은 정정 구조가 아닙니다");
        }
        
        const beamInfo = this.beam.getBeamInfo();
        const supports = beamInfo.supports;
        const loads = beamInfo.loads;
        
        // 구조물 유형에 따라 적절한 해석 메서드 호출
        if (this.isCantileverBeam(supports)) {
            this.solveCantileverBeam(supports, loads);
        } else if (supports.length === 2) {
            this.solveSimpleBeam(supports, loads);
        } else {
            throw new Error("지원되지 않는 구조물 유형입니다");
        }
    }
    
    // 외팔보(캔틸레버) 여부 확인
    private isCantileverBeam(supports: Support[]): boolean {
        return supports.length === 1 && supports[0] instanceof FixedSupport;
    }
    
    // 외팔보(캔틸레버) 해석
    private solveCantileverBeam(supports: Support[], loads: Load[]): void {
        const fixedSupport = supports[0];
        
        // 수직 방향 평형방정식: ΣFy = 0
        let totalLoadMagnitude = 0;
        // 모멘트 평형방정식: ΣM = 0 (고정단 기준)
        let totalMoment = 0;
        
        for (const load of loads) {
            totalLoadMagnitude += load.getMagnitude();
            
            if (load instanceof DistributedLoad) {
                // 분포하중의 경우 중심점 기준으로 모멘트 계산
                const startPos = load.getStartPosition();
                const endPos = load.getEndPosition();
                const unitMag = load.getUnitMagnitude();
                const loadLength = endPos - startPos;
                
                // 분포하중의 합력 작용점은 중심에서 작용
                const centerPos = (startPos + endPos) / 2;
                const distance = centerPos - fixedSupport.getPosition();
                totalMoment += unitMag * loadLength * distance;
            } else {
                // 집중하중 및 모멘트하중의 경우
                const distance = load.getPosition() - fixedSupport.getPosition();
                totalMoment += load.getMagnitude() * distance;
            }
        }
        
        // 고정단 반력 계산 - 인터페이스 메서드 사용
        fixedSupport.setReactionForceY(totalLoadMagnitude);
        fixedSupport.setReactionMoment(totalMoment);
        // 수평 하중이 없다면 수평 반력은 0
        fixedSupport.setReactionForceX(0);
    }
    
    // 단순보 해석
    private solveSimpleBeam(supports: Support[], loads: Load[]): void {
        // 지지점 찾기
        const leftSupport = supports[0].getPosition() < supports[1].getPosition() 
            ? supports[0] : supports[1];
        const rightSupport = supports[0].getPosition() > supports[1].getPosition() 
            ? supports[0] : supports[1];
        
        const span = rightSupport.getPosition() - leftSupport.getPosition();
        
        // 수직 방향 평형방정식: ΣFy = 0
        // 모멘트 평형방정식: ΣM = 0 (왼쪽 지지점에 대해)
        
        // 모든 하중의 총합 계산
        let totalLoadMagnitude = 0;
        let totalMomentAboutLeft = 0;
        
        for (const load of loads) {
            if (load instanceof DistributedLoad) {
                // 분포하중 처리
                const startPos = load.getStartPosition();
                const endPos = load.getEndPosition();
                const unitMag = load.getUnitMagnitude();
                const loadLength = endPos - startPos;
                
                // 합력의 크기는 단위하중 * 길이
                totalLoadMagnitude += unitMag * loadLength;
                
                // 분포하중의 합력 작용점은 중심에서 작용
                const centerPos = (startPos + endPos) / 2;
                const momentArm = centerPos - leftSupport.getPosition();
                totalMomentAboutLeft += unitMag * loadLength * momentArm;
            } else {
                // 집중하중과 모멘트하중 처리
                totalLoadMagnitude += load.getMagnitude();
                totalMomentAboutLeft += load.getMagnitude() * 
                    (load.getPosition() - leftSupport.getPosition());
            }
        }
        
        // 오른쪽 지지점의 반력 계산 (모멘트 평형 방정식 사용)
        const rightReaction = totalMomentAboutLeft / span;
        
        // 왼쪽 지지점의 반력 계산 (수직 평형 방정식 사용)
        const leftReaction = totalLoadMagnitude - rightReaction;
        
        // 반력 적용 - 인터페이스 메서드 사용
        leftSupport.setReactionForceY(leftReaction);
        rightSupport.setReactionForceY(rightReaction);
        
        // 수평 반력 - 현재는 수평 하중이 없으므로 0
        leftSupport.setReactionForceX(0);
        rightSupport.setReactionForceX(0);
        
        // 모멘트 반력 - 핀과 롤러는 모멘트를 지지할 수 없음
        leftSupport.setReactionMoment(0);
        rightSupport.setReactionMoment(0);
    }
    
    // 특정 위치에서의 전단력 계산
    calculateShearForce(position: number): number {
        return this.beam.calculateInternalForces(position).shearForce;
    }
    
    // 특정 위치에서의 휨모멘트 계산
    calculateBendingMoment(position: number): number {
        return this.beam.calculateInternalForces(position).bendingMoment;
    }
    
    // 전단력도 생성 (여러 지점에서의 값 계산)
    generateShearForceDistribution(numPoints: number = 100): { x: number, y: number }[] {
        const beamInfo = this.beam.getBeamInfo();
        const length = beamInfo.length;
        const result = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const position = (i / numPoints) * length;
            const shearForce = this.calculateShearForce(position);
            result.push({ x: position, y: shearForce });
        }
        
        return result;
    }
    
    // 휨모멘트도 생성
    generateBendingMomentDistribution(numPoints: number = 100): { x: number, y: number }[] {
        const beamInfo = this.beam.getBeamInfo();
        const length = beamInfo.length;
        const result = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const position = (i / numPoints) * length;
            const bendingMoment = this.calculateBendingMoment(position);
            result.push({ x: position, y: bendingMoment });
        }
        
        return result;
    }
}

// 이전 버전과의 호환성을 위해 StaticStructureSolver 클래스 유지
export class StaticStructureSolver extends Solver {
    constructor(beam: Beam) {
        super(beam);
    }
}
