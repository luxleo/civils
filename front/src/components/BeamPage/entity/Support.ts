export interface Support {
    getPosition: () => number;
    getReactionForceY: () => number;
    getReactionForceX: () => number;
    getReactionMoment: () => number;
    
    // 추가된 setter 메서드들
    setReactionForceY: (value: number) => void;
    setReactionForceX: (value: number) => void;
    setReactionMoment: (value: number) => void;
}
export class PinnedSupport implements Support {
    private readonly position: number;
    private reactionForceX: number = 0;
    private reactionForceY: number = 0;
    
    constructor(position: number) {
        if(position < 0) throw new Error("위치는 양수로 해주세요");
        this.position = position;
    }
    
    getPosition(): number {
        return this.position;
    }
    
    getReactionForceY(): number {
        return this.reactionForceY;
    }
    
    getReactionForceX(): number {
        return this.reactionForceX;
    }
    
    getReactionMoment(): number {
        return 0; // 핀 지지점은 모멘트 반력 없음
    }
    
    // 새로운 setter 메서드
    setReactionForceY(value: number): void {
        this.reactionForceY = value;
    }
    
    setReactionForceX(value: number): void {
        this.reactionForceX = value;
    }
    
    setReactionMoment(value: number): void {
        // 핀은 모멘트 반력을 가질 수 없음
        if (value !== 0) {
            console.warn("핀 지지점은 모멘트 반력을 가질 수 없습니다");
        }
    }
}

export class FixedSupport implements Support {
    private readonly position: number;
    private reactionForceX: number = 0;
    private reactionForceY: number = 0;
    private reactionMoment: number = 0;
    
    constructor(position: number) {
        if(position < 0) throw new Error("위치는 양수로 해주세요");
        this.position = position;
    }
    
    getPosition(): number {
        return this.position;
    }
    
    getReactionForceY(): number {
        return this.reactionForceY;
    }
    
    getReactionForceX(): number {
        return this.reactionForceX;
    }
    
    getReactionMoment(): number {
        return this.reactionMoment;
    }
    
    // 새로운 setter 메서드
    setReactionForceY(value: number): void {
        this.reactionForceY = value;
    }
    
    setReactionForceX(value: number): void {
        this.reactionForceX = value;
    }
    
    setReactionMoment(value: number): void {
        this.reactionMoment = value;
    }
}

export class RollerSupport implements Support {
    private readonly position: number;
    private reactionForceY: number = 0;
    
    constructor(position: number) {
        if(position < 0) throw new Error("위치는 양수로 해주세요");
        this.position = position;
    }
    
    getPosition(): number {
        return this.position;
    }

    getReactionForceY(): number {
        return this.reactionForceY;
    }
    
    getReactionForceX(): number {
        return 0; // 롤러 지지점은 수평 반력 없음
    }
    
    getReactionMoment(): number {
        return 0; // 롤러 지지점은 모멘트 반력 없음
    }
    
    // 새로운 setter 메서드
    setReactionForceY(value: number): void {
        this.reactionForceY = value;
    }
    
    setReactionForceX(value: number): void {
        // 롤러는 수평 반력을 가질 수 없음
        if (value !== 0) {
            console.warn("롤러 지지점은 수평 반력을 가질 수 없습니다");
        }
    }
    
    setReactionMoment(value: number): void {
        // 롤러는 모멘트 반력을 가질 수 없음
        if (value !== 0) {
            console.warn("롤러 지지점은 모멘트 반력을 가질 수 없습니다");
        }
    }
}