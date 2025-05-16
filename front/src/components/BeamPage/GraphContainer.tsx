import styled from "@emotion/styled";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const GraphContainer = () => {
    const svgRef = useRef(null);
    const gxRef = useRef(null); // X 축을 위한 ref
    const gyRef = useRef(null); // Y 축을 위한 ref
    const gridXRef = useRef(null); // X 그리드를 위한 ref
    const gridYRef = useRef(null); // Y 그리드를 위한 ref

    const width = 500;
    const height = 500;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const gx = d3.select(gxRef.current);
        const gy = d3.select(gyRef.current);
        const gridX = d3.select(gridXRef.current);
        const gridY = d3.select(gridYRef.current);

        // 초기 스케일 설정
        const xScale = d3.scaleLinear()
            .domain([0, 10]) // 초기 x축 범위
            .range([marginLeft, width - marginRight]);

        const yScale = d3.scaleLinear()
            .domain([0, 10]) // 초기 y축 범위
            .range([height - marginBottom, marginTop]);

        // 축 생성
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // 그리드 라인 생성 함수
        const xGridLines = () => d3.axisBottom(xScale)
            .tickSize(-(height - marginTop - marginBottom))
            .tickFormat('');

        const yGridLines = () => d3.axisLeft(yScale)
            .tickSize(-(width - marginLeft - marginRight))
            .tickFormat('');

        // 초기 축과 그리드 렌더링
        gx.call(xAxis);
        gy.call(yAxis);
        gridX.call(xGridLines());
        gridY.call(yGridLines());

        // 그리드 스타일 설정
        svg.selectAll(".grid line")
            .attr("stroke", "#e0e0e0")
            .attr("stroke-opacity", 0.5);
        svg.selectAll(".grid path")
            .style("stroke-width", 0);

        // 줌 동작 정의
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.5, 5]) // 줌 레벨 범위
            .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
            .translateExtent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
            .on("zoom", (event) => {
                const {transform} = event;
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);

                // 축 업데이트
                gx.call(xAxis.scale(newXScale));
                gy.call(yAxis.scale(newYScale));

                // 그리드 업데이트
                gridX.call(xGridLines().scale(newXScale));
                gridY.call(yGridLines().scale(newYScale));

                // 그리드 스타일 유지
                svg.selectAll(".grid line")
                    .attr("stroke", "#e0e0e0")
                    .attr("stroke-opacity", 0.5);
                svg.selectAll(".grid path")
                    .style("stroke-width", 0);

                // TODO: 그래프의 다른 요소들도 업데이트 (예: 점, 선 등)
                // 예시: svg.selectAll("circle").attr("cx", d => newXScale(d.x)).attr("cy", d => newYScale(d.y));
            });

        svg.call(zoomBehavior);

        // 초기 위치 지정
        gx.attr("transform", `translate(0,${height - marginBottom})`);
        gy.attr("transform", `translate(${marginLeft},0)`);
        gridX.attr("transform", `translate(0,${height - marginBottom})`);
        gridY.attr("transform", `translate(${marginLeft},0)`);
    }, []);


    return (
        <div>
            <S.Svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
            >
                {/* 그리드 먼저 그려서 뒤에 배치 */}
                <g ref={gridXRef} className="grid" />
                <g ref={gridYRef} className="grid" />
                {/* 그래프 데이터가 그리드와 축 사이에 그려지도록 여기에 삽입 */}
                <g ref={gxRef} />
                <g ref={gyRef} />
            </S.Svg>
            <button onClick={() => {
                const svgEl = d3.select(svgRef.current);
                // 현재 스케일을 사용하여 사각형 추가 (줌/팬에 따라 동적으로 위치/크기 조정 필요)
                const currentXScale = d3.scaleLinear()
                    .domain(d3.zoomTransform(svgEl.node()).rescaleX(d3.scaleLinear().domain([0, 10])).domain())
                    .range([marginLeft, width - marginRight]);
                const currentYScale = d3.scaleLinear().domain(d3.zoomTransform(svgEl.node()).rescaleY(d3.scaleLinear().domain([0, 10])).domain()).range([height - marginBottom, marginTop]);

                svgEl.append("rect")
                    .attr("x", currentXScale(1)) // 예시 좌표
                    .attr("y", currentYScale(9)) // 예시 좌표
                    .attr("width", currentXScale(3) - currentXScale(1)) // 예시 너비
                    .attr("height", currentYScale(7) - currentYScale(9)) // 예시 높이
                    .attr("fill", "blue");
            }}>
                + rect (Zoom Aware)
            </button>
        </div>
    );
};

const S = {
    GraphContainer: styled.div`
        width: 500px;
        height: 500px;
    `,
    Svg: styled.svg`
        background-color: tomato;
    `
}
export default GraphContainer;