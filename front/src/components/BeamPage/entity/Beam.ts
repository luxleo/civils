import {DistributedLoad, type Load} from "./Load";
import {FixedSupport, PinnedSupport, RollerSupport, type Support} from "./Support";

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
    private length: number;
    private supports: Support[] = [];
    private loads: Load[] = [];

    constructor(length: number) {
        if (length <= 0) throw new Error("길이는 양수로 해주세요");
        this.length = length;
    }

    // 지지점 추가 메서드
    addSupport(support: Support): void {
        if (support.getPosition() > this.length) {
            throw new Error("지지점 위치는 보의 길이보다 작아야 합니다");
        }
        this.supports.push(support);
    }

    // 하중 추가 메서드
    addLoad(load: Load): void {
        if (load.getPosition() > this.length) {
            throw new Error("하중 위치는 보의 길이보다 작아야 합니다");
        }
        this.loads.push(load);
    }

    // 길이 변경 메서드
    changeLength(newLength: number): void {
        if (newLength <= 0) throw new Error("길이는 양수로 해주세요");
        this.length = newLength;
        
        // 길이가 변경되면 지지점과 하중의 위치가 유효한지 확인
        this.supports = this.supports.filter(support => support.getPosition() <= this.length);
        this.loads = this.loads.filter(load => load.getPosition() <= this.length);
    }

    // 구조물의 안정성 확인 (정정 구조인지 확인)
    isStaticallyDeterminate(): boolean {
        // 기본적인 안정성 조건: 지지점 반력 수 == 평형 방정식 수
        // 2D 경우 보통 3개의 평형 방정식(ΣFx = 0, ΣFy = 0, ΣM = 0)
        
        let reactionComponents = 0;
        
        for (const support of this.supports) {
            if (support instanceof PinnedSupport) reactionComponents += 2; // Fx, Fy
            else if (support instanceof RollerSupport) reactionComponents += 1; // Fy
            else if (support instanceof FixedSupport) reactionComponents += 3; // Fx, Fy, M
        }
        
        // 2D 보의 경우 평형 방정식은 3개
        return reactionComponents === 3;
    }


    // 특정 위치에서의 내력(전단력, 휨모멘트) 계산
    calculateInternalForces(position: number): { shearForce: number, bendingMoment: number } {
        if (position < 0 || position > this.length) {
            throw new Error("위치는 보의 길이 범위 내에 있어야 합니다");
        }
        
        let shearForce = 0;
        let bendingMoment = 0;
        
        // 지지점 반력 적용
        for (const support of this.supports) {
            // 왼쪽에서 오른쪽 방향 계산: 지지점이 위치보다 왼쪽에 있을 때
            if (support.getPosition() < position) {
                shearForce += support.getReactionForceY();
                bendingMoment += support.getReactionForceY() * (position - support.getPosition());
                
                if (support instanceof PinnedSupport || support instanceof FixedSupport) {
                    shearForce += support.getReactionForceX();
                }
                
                if (support instanceof FixedSupport) {
                    bendingMoment += support.getReactionMoment();
                }
            }
            // 오른쪽에서 왼쪽 방향 계산: 지지점이 위치보다 오른쪽에 있을 때
            else if (support.getPosition() > position) {
                shearForce -= support.getReactionForceY();
                bendingMoment += support.getReactionForceY() * (support.getPosition() - position);
                
                if (support instanceof PinnedSupport || support instanceof FixedSupport) {
                    shearForce -= support.getReactionForceX();
                }
                
                if (support instanceof FixedSupport) {
                    bendingMoment -= support.getReactionMoment();
                }
            }
        }
        
        // 하중 적용
        for (const load of this.loads) {
            // 분포하중 특별 처리
            if (load instanceof DistributedLoad) {
                const startPos = (load as DistributedLoad).getStartPosition();
                const endPos = (load as DistributedLoad).getEndPosition();
                const unitMag = (load as DistributedLoad).getUnitMagnitude();
                
                // 위치가 분포하중 구간을 완전히 지난 경우 (오른쪽)
                if (position > endPos) {
                    // 분포하중의 전체 크기
                    const totalLoad = unitMag * (endPos - startPos);
                    // 분포하중의 합력 작용점은 중심에서 작용
                    const centerPos = (startPos + endPos) / 2;
                    shearForce -= totalLoad;
                    bendingMoment -= totalLoad * (position - centerPos);
                }
                // 위치가 분포하중 구간을 완전히 앞선 경우 (왼쪽)
                else if (position < startPos) {
                    // 분포하중의 전체 크기
                    const totalLoad = unitMag * (endPos - startPos);
                    // 분포하중의 합력 작용점은 중심에서 작용
                    const centerPos = (startPos + endPos) / 2;
                    shearForce += totalLoad;
                    bendingMoment -= totalLoad * (centerPos - position);
                }
                // 위치가 분포하중 구간 내에 있는 경우
                else {
                    // 시작점부터 현재 위치까지의 부분 하중
                    const partialLength = position - startPos;
                    const partialLoad = unitMag * partialLength;
                    // 부분 하중의 작용점은 시작점과 현재 위치의 중간
                    const partialCenter = startPos + partialLength / 2;
                    shearForce -= partialLoad;
                    bendingMoment -= partialLoad * (position - partialCenter);
                    
                    // 현재 위치부터 끝점까지의 부분 하중 (오른쪽 부분)
                    const remainingLength = endPos - position;
                    const remainingLoad = unitMag * remainingLength;
                    // 나머지 부분 하중의 작용점은 현재 위치와 끝점의 중간
                    const remainingCenter = position + remainingLength / 2;
                    shearForce += remainingLoad;
                    bendingMoment -= remainingLoad * (remainingCenter - position);
                }
                
                // 만약 삼각형 분포하중이면 추가 처리 (TriangularDistributedLoad 클래스로 확장될 경우)
                if ((load as any).isTriangular && (load as any).isTriangular()) {
                    // 삼각형 분포하중의 경우 합력 위치와 크기를 조정해야 함
                    // 이 부분은 TriangularDistributedLoad 클래스가 구현되면 해당 클래스에서 직접 처리하도록 변경
                }
            }
            // 일반 하중(집중하중, 모멘트하중) 처리
            else {
                const loadPosition = load.getPosition();
                
                // 하중이 위치보다 왼쪽에 있을 때 (진행 방향에서 지난 하중)
                if (loadPosition < position) {
                    shearForce -= load.getMagnitude();
                    bendingMoment -= load.getMagnitude() * (position - loadPosition);
                }
                // 하중이 위치보다 오른쪽에 있을 때 (진행 방향에서 앞에 있는 하중)
                else if (loadPosition > position) {
                    shearForce += load.getMagnitude();
                    bendingMoment -= load.getMagnitude() * (loadPosition - position);
                }
                // 하중이 정확히 위치에 있을 때 (모멘트 하중의 경우만 영향)
                else if (load instanceof MomentLoad) {
                    bendingMoment -= load.getMagnitude();
                }
            }
        }
        
        return { shearForce, bendingMoment };
    }
    
    // 보의 상태 정보 반환
    getBeamInfo(): { length: number, supports: Support[], loads: Load[] } {
        return {
            length: this.length,
            supports: [...this.supports],
            loads: [...this.loads]
        };
    }
}