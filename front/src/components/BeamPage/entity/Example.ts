import { Beam } from './Beam.ts';
import { PinnedSupport, RollerSupport, FixedSupport } from './Support.ts';
import { PointLoad, DistributedLoad, MomentLoad } from './Load.ts';
import { StaticStructureSolver } from './Solver.ts';
import { BeamDiagram } from './Diagram.ts';

/**
 * 다양한 정정 구조 문제 예제를 제공하는 클래스
 */
export class StaticStructureExamples {
    /**
     * 단순보 (Simple Beam) 예제 생성
     * - 양 끝에 핀과 롤러 지지점이 있는 보
     * - 중앙에 포인트 하중이 작용
     */
    static createSimpleBeamExample(length: number = 10, loadMagnitude: number = 10): Beam {
        const beam = new Beam(length);
        
        // 왼쪽 끝에 핀 지지점, 오른쪽 끝에 롤러 지지점 추가
        const leftSupport = new PinnedSupport(0);
        const rightSupport = new RollerSupport(length);
        beam.addSupport(leftSupport);
        beam.addSupport(rightSupport);
        
        // 중앙에 집중 하중 추가
        const centerLoad = new PointLoad(length / 2, loadMagnitude);
        beam.addLoad(centerLoad);
        
        return beam;
    }
    
    /**
     * 캔틸레버 보 (Cantilever Beam) 예제 생성
     * - 한쪽 끝에 고정 지지점이 있고 다른 쪽은 자유단
     * - 자유단에 하중이 작용
     */
    static createCantileverBeamExample(length: number = 5, loadMagnitude: number = 10): Beam {
        const beam = new Beam(length);
        
        // 왼쪽 끝에 고정 지지점 추가
        const fixedSupport = new FixedSupport(0);
        beam.addSupport(fixedSupport);
        
        // 오른쪽 끝(자유단)에 집중 하중 추가
        const endLoad = new PointLoad(length, loadMagnitude);
        beam.addLoad(endLoad);
        
        return beam;
    }
    
    /**
     * 분포 하중을 받는 단순보 예제 생성
     * - 양 끝에 핀과 롤러 지지점이 있는 보
     * - 전체 길이에 걸쳐 균일한 분포 하중이 작용
     */
    static createDistributedLoadBeamExample(length: number = 10, loadMagnitude: number = 2): Beam {
        const beam = new Beam(length);
        
        // 왼쪽 끝에 핀 지지점, 오른쪽 끝에 롤러 지지점 추가
        const leftSupport = new PinnedSupport(0);
        const rightSupport = new RollerSupport(length);
        beam.addSupport(leftSupport);
        beam.addSupport(rightSupport);
        
        // 전체 길이에 걸쳐 분포 하중 추가
        const uniformLoad = new DistributedLoad(0, length, loadMagnitude);
        beam.addLoad(uniformLoad);
        
        return beam;
    }
    
    /**
     * 모멘트 하중을 받는 단순보 예제 생성
     * - 양 끝에 핀과 롤러 지지점이 있는 보
     * - 중앙에 모멘트 하중이 작용
     */
    static createMomentLoadBeamExample(length: number = 10, momentMagnitude: number = 20): Beam {
        const beam = new Beam(length);
        
        // 왼쪽 끝에 핀 지지점, 오른쪽 끝에 롤러 지지점 추가
        const leftSupport = new PinnedSupport(0);
        const rightSupport = new RollerSupport(length);
        beam.addSupport(leftSupport);
        beam.addSupport(rightSupport);
        
        // 중앙에 모멘트 하중 추가
        const centerMoment = new MomentLoad(length / 2, momentMagnitude);
        beam.addLoad(centerMoment);
        
        return beam;
    }
    
    /**
     * 다중 하중 및 지지점이 있는 보 예제 생성
     * - 복잡한 정정 구조 예제
     */
    static createComplexStaticallyDeterminateExample(): Beam {
        const beam = new Beam(12);
        
        // 지지점 추가: 왼쪽 끝에 핀, 오른쪽 끝에 롤러
        beam.addSupport(new PinnedSupport(0));
        beam.addSupport(new RollerSupport(12));
        
        // 여러 하중 추가
        beam.addLoad(new PointLoad(3, 10)); // 3m 위치에 10kN
        beam.addLoad(new PointLoad(8, 15)); // 8m 위치에 15kN
        beam.addLoad(new DistributedLoad(5, 9, 2)); // 5m~9m 구간에 2kN/m
        
        return beam;
    }
    
    /**
     * 예제를 실행하고 계산 결과를 표시
     */
    static runExample(beam: Beam, containerId: string): void {
        // 구조 해석기 생성
        const solver = new StaticStructureSolver(beam);
        
        try {
            // 반력 계산
            solver.solveReactions();
            
            // 다이어그램 렌더링
            const diagram = new BeamDiagram(beam, containerId);
            diagram.renderAll();
            
            // 결과 텍스트 출력
            const resultContainer = document.createElement('div');
            resultContainer.className = 'result-container';
            document.getElementById(containerId)?.appendChild(resultContainer);
            
            // 정정 구조 여부 확인
            resultContainer.innerHTML += `<p>정정 구조 여부: ${beam.isStaticallyDeterminate() ? '예' : '아니오'}</p>`;
            
            // 보 정보 출력
            const beamInfo = beam.getBeamInfo();
            resultContainer.innerHTML += `<p>보 길이: ${beamInfo.length}m</p>`;
            
            // 지지점 정보 출력
            resultContainer.innerHTML += `<h3>지지점 정보:</h3>`;
            beamInfo.supports.forEach((support, index) => {
                resultContainer.innerHTML += `
                    <p>지지점 ${index + 1}: 위치 ${support.getPosition()}m, 
                    유형 ${support.constructor.name},
                    수직 반력 ${support.getReactionForceY().toFixed(2)}kN,
                    수평 반력 ${support.getReactionForceX().toFixed(2)}kN,
                    모멘트 반력 ${support.getReactionMoment().toFixed(2)}kN·m</p>
                `;
            });
            
            // 하중 정보 출력
            resultContainer.innerHTML += `<h3>하중 정보:</h3>`;
            beamInfo.loads.forEach((load, index) => {
                resultContainer.innerHTML += `
                    <p>하중 ${index + 1}: 위치 ${load.getPosition()}m, 크기 ${load.getMagnitude().toFixed(2)}kN</p>
                `;
            });
        } catch (error) {
            console.error('예제 실행 중 오류 발생:', error);
        }
    }
}
