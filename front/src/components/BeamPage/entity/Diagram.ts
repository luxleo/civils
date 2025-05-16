import * as d3 from 'd3';
import { Beam } from './Beam.ts';
import { Solver } from './Solver.ts';

export class BeamDiagram {
    private beam: Beam;
    private solver: Solver;
    private container: HTMLElement;
    
    constructor(beam: Beam, containerId: string) {
        this.beam = beam;
        this.solver = new Solver(beam);
        this.container = document.getElementById(containerId) as HTMLElement;
        
        if (!this.container) {
            throw new Error(`컨테이너 ID ${containerId}를 찾을 수 없습니다`);
        }
    }
    
    // 보 및 지지점, 하중 등을 시각화
    renderBeam(): void {
        const beamInfo = this.beam.getBeamInfo();
        const width = this.container.clientWidth;
        const height = 200;
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        
        // 스케일 설정
        const xScale = d3.scaleLinear()
            .domain([0, beamInfo.length])
            .range([margin.left, width - margin.right]);
        
        // SVG 요소 생성
        const svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 보 그리기
        svg.append('line')
            .attr('x1', xScale(0))
            .attr('y1', height / 2)
            .attr('x2', xScale(beamInfo.length))
            .attr('y2', height / 2)
            .attr('stroke', 'black')
            .attr('stroke-width', 3);
        
        // 지지점 그리기
        for (const support of beamInfo.supports) {
            const x = xScale(support.getPosition());
            
            if (support.constructor.name === 'PinnedSupport') {
                // 핀 지지점 표현
                svg.append('polygon')
                    .attr('points', `${x},${height/2+10} ${x-10},${height/2+30} ${x+10},${height/2+30}`)
                    .attr('fill', 'none')
                    .attr('stroke', 'black');
                
                // 삼각형 아래 수평선
                svg.append('line')
                    .attr('x1', x - 15)
                    .attr('y1', height/2 + 30)
                    .attr('x2', x + 15)
                    .attr('y2', height/2 + 30)
                    .attr('stroke', 'black');
            } else if (support.constructor.name === 'RollerSupport') {
                // 롤러 지지점 표현
                svg.append('circle')
                    .attr('cx', x)
                    .attr('cy', height/2 + 20)
                    .attr('r', 5)
                    .attr('fill', 'black');
                
                // 원 아래 수평선
                svg.append('line')
                    .attr('x1', x - 15)
                    .attr('y1', height/2 + 30)
                    .attr('x2', x + 15)
                    .attr('y2', height/2 + 30)
                    .attr('stroke', 'black');
            } else if (support.constructor.name === 'FixedSupport') {
                // 고정 지지점 표현
                svg.append('line')
                    .attr('x1', x)
                    .attr('y1', height/2 - 20)
                    .attr('x2', x)
                    .attr('y2', height/2 + 20)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2);
                
                // 여러 개의 짧은 수평선으로 고정 지지점 표현
                for (let i = -20; i <= 20; i += 5) {
                    svg.append('line')
                        .attr('x1', x)
                        .attr('y1', height/2 + i)
                        .attr('x2', x - 10)
                        .attr('y2', height/2 + i)
                        .attr('stroke', 'black');
                }
            }
        }
        
        // 하중 그리기
        for (const load of beamInfo.loads) {
            const x = xScale(load.getPosition());
            
            // 화살표 그리기
            svg.append('line')
                .attr('x1', x)
                .attr('y1', height/2 - 10)
                .attr('x2', x)
                .attr('y2', height/2 - 30)
                .attr('stroke', 'red')
                .attr('marker-end', 'url(#arrow)');
                
            // 하중 값 표시
            svg.append('text')
                .attr('x', x)
                .attr('y', height/2 - 40)
                .attr('text-anchor', 'middle')
                .text(`${load.getMagnitude()} kN`);
        }
        
        // 화살표 마커 정의
        svg.append('defs').append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', 'red');
    }
    
    // 전단력도 렌더링
    renderShearForceGraph(): void {
        this.solver.solveReactions();
        const shearData = this.solver.generateShearForceDistribution();
        this.renderGraph(shearData, '전단력도 (kN)', 'blue');
    }
    
    // 휨모멘트도 렌더링
    renderBendingMomentGraph(): void {
        this.solver.solveReactions();
        const momentData = this.solver.generateBendingMomentDistribution();
        this.renderGraph(momentData, '휨모멘트도 (kN·m)', 'green');
    }
    
    // 그래프 렌더링을 위한 일반적인 메서드
    private renderGraph(data: { x: number, y: number }[], title: string, color: string): void {
        const width = this.container.clientWidth;
        const height = 300;
        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        
        // 그래프를 위한 새로운 컨테이너 생성
        const graphContainer = document.createElement('div');
        graphContainer.className = 'graph-container';
        this.container.appendChild(graphContainer);
        
        // 데이터의 y값 범위 계산
        const yMin = d3.min(data, d => d.y) as number;
        const yMax = d3.max(data, d => d.y) as number;
        const yPadding = Math.max(Math.abs(yMin), Math.abs(yMax)) * 0.1; // 10% 패딩
        
        // 스케일 설정
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.x) as number])
            .range([margin.left, width - margin.right]);
            
        const yScale = d3.scaleLinear()
            .domain([yMin - yPadding, yMax + yPadding])
            .range([height - margin.bottom, margin.top]);
        
        // SVG 요소 생성
        const svg = d3.select(graphContainer)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 그래프 제목
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .text(title);
        
        // x축
        svg.append('g')
            .attr('transform', `translate(0,${yScale(0)})`)
            .call(d3.axisBottom(xScale));
            
        // y축
        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));
        
        // 라인 함수 정의
        const line = d3.line<{x: number, y: number}>()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y));
        
        // 라인 그리기
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', line);
        
        // x축 레이블
        svg.append('text')
            .attr('transform', `translate(${width/2}, ${height - 10})`)
            .style('text-anchor', 'middle')
            .text('위치 (m)');
        
        // y축 레이블
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 10)
            .attr('x', -(height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text(() => {
                if (title.includes('전단력')) return '전단력 (kN)';
                else if (title.includes('휨모멘트')) return '휨모멘트 (kN·m)';
                return '값';
            });
    }
    
    // 모든 다이어그램 렌더링 (보, 전단력도, 휨모멘트도)
    renderAll(): void {
        // 기존 콘텐츠 제거
        this.container.innerHTML = '';
        
        // 보 다이어그램 렌더링
        this.renderBeam();
        
        // 전단력도 렌더링
        this.renderShearForceGraph();
        
        // 휨모멘트도 렌더링
        this.renderBendingMomentGraph();
    }
}
