import {DistributedLoad, type Load, MomentLoad} from "./Load";
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

        // 왼쪽에서 오른쪽 방향으로 일관되게 계산
        // 1. 왼쪽에서 오른쪽으로 진행하면서 지지점 반력 적용
        for (const support of this.supports) {
            const supportPosition = support.getPosition();

            // 지지점이 계산 위치보다 왼쪽에 있는 경우
            if (supportPosition < position) {
                // 수직 반력 (상향력은 양수)
                shearForce += support.getReactionForceY();
                // 모멘트 계산 (반시계 방향이 양수)
                bendingMoment += support.getReactionForceY() * (position - supportPosition);

                // 수평 반력 (오른쪽 방향이 양수)
                if (support instanceof PinnedSupport || support instanceof FixedSupport) {
                    shearForce += support.getReactionForceX();
                }

                // 모멘트 반력 (반시계 방향이 양수)
                if (support instanceof FixedSupport) {
                    bendingMoment += support.getReactionMoment();
                }
            }
        }

        // 2. 왼쪽에서 오른쪽으로 진행하면서 하중 적용
        for (const load of this.loads) {
            // 분포하중 특별 처리
            if (load instanceof DistributedLoad) {
                const startPos = load.getStartPosition();
                const endPos = load.getEndPosition();
                const startMag = load.getStartMagnitude();
                // endMag is only used in the partial load calculation
                const totalLoad = load.getMagnitude();
                const centerPos = load.getPosition(); // 무게중심 위치

                // 위치가 분포하중 구간을 완전히 지난 경우 (오른쪽)
                if (position > endPos) {
                    // 분포하중은 아래 방향이 양수이므로, 전단력에는 음수로 기여
                    shearForce -= totalLoad;
                    // 모멘트 계산 (반시계 방향이 양수)
                    bendingMoment -= totalLoad * (position - centerPos);
                }
                // 위치가 분포하중 구간을 완전히 앞선 경우 (왼쪽)
                else if (position < startPos) {
                    // 아직 하중에 도달하지 않았으므로 영향 없음
                    continue;
                }
                // 위치가 분포하중 구간 내에 있는 경우
                else {
                    // 시작점부터 현재 위치까지의 부분 하중
                    const partialLength = position - startPos;

                    // 현재 위치에서의 단위 하중 크기 (선형 보간)
                    const magAtPosition = load.getMagnitudeAt(position);

                    // 왼쪽 부분 (시작점부터 현재 위치까지)
                    // 사다리꼴/삼각형 면적 계산: (밑변1 + 밑변2) * 높이 / 2
                    const leftPartialLoad = (startMag + magAtPosition) * partialLength / 2;
                    // 왼쪽 부분의 무게중심 계산
                    const leftCenterRatio = (startMag + 2 * magAtPosition) / (3 * (startMag + magAtPosition));
                    const leftCenter = startPos + partialLength * leftCenterRatio;

                    // 왼쪽 부분 하중의 영향
                    shearForce -= leftPartialLoad;
                    bendingMoment -= leftPartialLoad * (position - leftCenter);
                }
            }
            // 일반 하중(집중하중, 모멘트하중) 처리
            else {
                const loadPosition = load.getPosition();

                // 하중이 위치보다 왼쪽에 있을 때만 고려 (왼쪽에서 오른쪽 방향)
                if (loadPosition < position) {
                    // 집중하중은 아래 방향이 양수이므로, 전단력에는 음수로 기여
                    shearForce -= load.getMagnitude();
                    // 모멘트 계산 (반시계 방향이 양수)
                    bendingMoment -= load.getMagnitude() * (position - loadPosition);
                }
                // 하중이 정확히 위치에 있을 때 (모멘트 하중의 경우만 영향)
                else if (loadPosition === position && load instanceof MomentLoad) {
                    // 모멘트 하중 (반시계 방향이 양수)
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
