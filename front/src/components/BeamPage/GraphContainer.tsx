import styled from "@emotion/styled";
import {useRef} from "react";
import * as d3 from "d3";
 // TODO: check whether script with async which is imported in one page remove when other page rendered
const GraphContainer = () => {
    const svgRef = useRef(null);
    return (
        <div>
            <S.Svg
                ref={svgRef}
                width={500}
                height={500}
                viewBox={"0 0 500 500"}
            />
            <button onClick={() => {
                const svgEl = d3.select(svgRef.current);
                svgEl.append("rect")
                    .attr("x", 10)
                    .attr("y", 10)
                    .attr("width", 50)
                    .attr("height", 50)
                    .attr("fill", "blue");
            }}>
                + rect
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