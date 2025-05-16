export interface Load {
    getPosition: () => number;
    getMagnitude: () => number; // 하중의 크기
}
export class PointLoad implements Load {
    private readonly position: number;
    private readonly magnitude: number;

    constructor(position: number, magnitude: number) {
        if (position < 0) throw new Error("위치는 양수로 해주세요");
        this.position = position;
        this.magnitude = magnitude;
    }

    getPosition(): number {
        return this.position;
    }

    getMagnitude(): number {
        return this.magnitude;
    }
}

export class DistributedLoad implements Load {
    private readonly startPosition: number;
    private readonly endPosition: number;
    private readonly startMagnitude: number; // 시작점에서의 단위 길이당 하중 크기
    private readonly endMagnitude: number; // 끝점에서의 단위 길이당 하중 크기

    constructor(startPosition: number, endPosition: number, startMagnitude: number, endMagnitude: number = startMagnitude) {
        if (startPosition < 0) throw new Error("시작 위치는 양수로 해주세요");
        if (endPosition <= startPosition) throw new Error("끝 위치는 시작 위치보다 커야 합니다");

        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.startMagnitude = startMagnitude;
        this.endMagnitude = endMagnitude;
    }

    // 사다리꼴 분포하중의 작용점 위치 반환 (무게중심)
    getPosition(): number {
        // 삼각형 또는 사다리꼴의 무게중심 위치 계산
        if (this.startMagnitude === 0) {
            // 삼각형 형태 (시작점에서 0, 끝점에서 최대)
            return this.startPosition + (this.endPosition - this.startPosition) * 2/3;
        } else if (this.endMagnitude === 0) {
            // 삼각형 형태 (시작점에서 최대, 끝점에서 0)
            return this.startPosition + (this.endPosition - this.startPosition)/3;
        } else if (this.startMagnitude === this.endMagnitude) {
            // 균일 분포하중의 경우 중앙에 위치
            return (this.startPosition + this.endPosition) / 2;
        } else {
            // 사다리꼴 형태
            const total = this.startMagnitude + this.endMagnitude;
            if (total === 0) return (this.startPosition + this.endPosition) / 2; // 안전장치: 양쪽 모두 0인 경우
            return this.startPosition + (this.endPosition - this.startPosition) * 
                  (this.startMagnitude + 2 * this.endMagnitude) / (3 * total);
        }
    }

    // 전체 하중의 합 (사다리꼴 면적)
    getMagnitude(): number {
        return (this.startMagnitude + this.endMagnitude) * (this.endPosition - this.startPosition) / 2;
    }

    // 시작 위치 반환
    getStartPosition(): number {
        return this.startPosition;
    }

    // 끝 위치 반환
    getEndPosition(): number {
        return this.endPosition;
    }

    // 시작점에서의 단위 하중 반환
    getStartMagnitude(): number {
        return this.startMagnitude;
    }

    // 끝점에서의 단위 하중 반환
    getEndMagnitude(): number {
        return this.endMagnitude;
    }

    // 특정 위치에서의 단위 하중 반환
    getMagnitudeAt(position: number): number {
        if (position < this.startPosition || position > this.endPosition) {
            return 0;
        }

        // 위치에 따른 선형 보간
        const ratio = (position - this.startPosition) / (this.endPosition - this.startPosition);
        return this.startMagnitude + ratio * (this.endMagnitude - this.startMagnitude);
    }

    // 균일 분포하중인지 확인
    isUniform(): boolean {
        return this.startMagnitude === this.endMagnitude;
    }

    // 삼각형 분포하중인지 확인
    isTriangular(): boolean {
        return this.startMagnitude === 0 || this.endMagnitude === 0;
    }

    // 사다리꼴 분포하중인지 확인
    isTrapezoidalOnly(): boolean {
        return !this.isUniform() && !this.isTriangular();
    }

    // 호환성을 위한 메서드 (이전의 DistributedLoad와 호환)
    getUnitMagnitude(): number {
        // 균일 분포하중인 경우 단일 값 반환
        if (this.isUniform()) {
            return this.startMagnitude;
        }
        // 평균 단위 하중 반환
        return (this.startMagnitude + this.endMagnitude) / 2;
    }
}

export class MomentLoad implements Load {
    private readonly position: number;
    private readonly magnitude: number;

    constructor(position: number, magnitude: number) {
        if (position < 0) throw new Error("위치는 양수로 해주세요");
        this.position = position;
        this.magnitude = magnitude;
    }

    getPosition(): number {
        return this.position;
    }

    getMagnitude(): number {
        return this.magnitude;
    }
}
