let dimensions = [];
function drawViz(data) {
    const body = document.getElementsByTagName("body")[0];
    const svgAttr = {
        "width": body.clientWidth,
        "height": body.clientHeight,
    }
    let svg = document.getElementById('svg');
    if (!svg) {
        svg = d3.select('body')
            .append('svg')
            .attr('width', svgAttr.width)
            .attr('height', svgAttr.height)
            .attr("viewBox",[0, 0, svgAttr.width, svgAttr.height])
            .attr('id', "svg");
    } else {
        svg = d3.select('svg');
        document.getElementById('svg').innerHTML = "";
    }
    /*
    svg.append("circle")
        .attr("cx", svgAttr.width / 2)
        .attr("cy", svgAttr.height / 2)
        .attr("r", 10)
        .attr("fill", getColorFromPalette());
    drawDiagonals();
    */
    dimensions = data.fields.tableDimension.map(td => td.id);
    graphCluster(data);
    console.info("Graph finished");
}

/*******************************************************************************
*                                                                              *
*                              Auxiliary functions                             *
*                                                                              *
*******************************************************************************/

/**
 * Graph data in cluster view
 * @param {*} data
 */
function graphCluster(data) {
    const nrows = 200;
    const rows = data.tables.DEFAULT.rows.slice(0, nrows);
    const transformedData = extractGraphData(rows);
    const nodes = extractNodes(transformedData);
    const links = extractLinks(transformedData);
    const minData = Math.min(...transformedData.map( i => i.value));
    const maxData = Math.max(...transformedData.map( i => i.value));
    const domain= {
        min: minData,
        max: maxData,
    };
    //console.dir(transformedData);
    //console.dir(nodes);
    //console.dir(links);
    drawGraph(nodes, links, domain);
}

function drawGraph(nodes, links, domain){
    const padding = 30;
    const svg = d3.select("svg");
    const width = svg.attr("width");
    const height = svg.attr("height");
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const maxRadius = Math.min(width, height)/15;
    const minRadius = 5;
    const scalerRadius = d3.scaleLinear()
        .domain([domain.min, domain.max])
        .range([minRadius, maxRadius]);
    
    let link = svg
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
            .style("stroke", "#aaa");

    let node = svg
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
            .attr("r", d => scalerRadius(d.r))
            //.style("fill", d => getColorFromPalette(+d.group-1))
            .style("fill", d => color(d.group))
            .attr("stroke", "#999")
            .attr("stroke-width", 1.5)
            .on("click", event =>{
                const interactionId = "filter";
                //const dimensions = ["qt_viyz5ik9ed", "qt_einoejk9ed"];
                const index = event.dim == "dim1" ? 0 : 1;
                const dimension = dimensions[index];
                const filter = dscc.InteractionType.FILTER;
                const interactionData = {
                    concepts: [dimension],
                    values: [[event.id]]
                }
                dscc.sendInteraction(interactionId, filter, interactionData);
            });
    node.append("title")
        .text(d => d.id);
    
    /*
    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    /*/

    // Create a simulation with several forces.
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(30))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius( d => scalerRadius(d.r) + padding ))
        .on("tick", ticked)
        .on("end", ended);
    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }
    function ended(){
        //Solo dim1 deben tener etiqueta
        const fontSize = 18;
        const textElements = svg.selectAll("text")
            .data(nodes.filter(i => i.dim == "dim1"))
            .enter()
            .append("text")
            .attr("x", i => i.x - i.id.length*fontSize/4)
            .attr("y", i => i.y)
            .text(i => i.id)
            .attr("opacity", 0.6)
            .attr("font-size", fontSize+"px")
            .attr("fill", "#000")
            .on("click", event =>{
                const interactionId = "filter";
                //const dimensions = ["qt_viyz5ik9ed", "qt_einoejk9ed"];
                const index = event.dim == "dim1" ? 0 : 1;
                const dimension = dimensions[index];
                const filter = dscc.InteractionType.FILTER;
                const interactionData = {
                    concepts: [dimension],
                    values: [[event.id]]
                }
                dscc.sendInteraction(interactionId, filter, interactionData);
            });
    }
    const zoom = d3.zoom()
        .scaleExtent([1, 2])
        .on("zoom", e => {
            svg.attr("transform", d3.event.transform);
        });
    svg.call(zoom);
    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        console.dir(event);
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.vx = event.x;
        event.vy = event.y;
    }
    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        console.dir(event);
        event.vx = event.x;
        event.vy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that itâ€™s no longer being dragged.
    function dragended(event) {
        console.dir(event);
        if (!event.active) simulation.alphaTarget(0);
        event.vx = null;
        event.vy = null;
    }

    // When this cell is re-run, stop the previous simulation. (This doesnâ€™t
    // really matter since the target alpha is zero and the simulation will
    // stop naturally, but itâ€™s a good practice.)
    //invalidation.then(() => simulation.stop());
}

/**
 * Extracts the list of links
 * @param {object[]} data with the links
 * @returns {object[]} List of links
 */
function extractLinks(data) {
    const links = [];
    data.forEach(i => {
        let link = {
            source: i.dim1,
            target: i.dim2,
            value: i.value,
        }
        links.push(link);
    });
    return links;
}

/**
 * Extracts the list of nodes
 * @param {object[]} data with node information
 * @returns {object[]} List of nodes
 */
function extractNodes(data) {
    let group = 1;
    const nodeInfo = [];
    const nodes = [];
    data.forEach(i => {
        let node1 = nodes.find(n => n.id == i.dim1);
        let currGroup = nodeInfo.find(n => n.id == i.dim1);
        if (!currGroup) {
            currGroup = {
                id: i.dim1,
                group: group++,
            }
            nodeInfo.push(currGroup);
        }
        if (!node1) {
            node1 = {
                id: i.dim1,
                group: currGroup.group,
                r: i.value,
                dim: "dim1",
            }
            nodes.push(node1);
        }
        let node2 = nodes.find(n => n.id == i.dim2);
        if (!node2) {
            node2 = {
                id: i.dim2,
                group: currGroup.group,
                r: 5,
                dim: "dim2",
            }
            nodes.push(node2);
        }
    });
    return nodes;
}

/** Transforms data into objects
 * @param {string[][]} rows
 * @returns {object[]} Graph data
 */
function extractGraphData(rows) {
    const graphData = [];
    rows.forEach(r => {
        //if (r[0] != null && r[1] != null) {
            let item = {
                dim1: r[0],
                dim2: r[1],
                value: +r[2],
            }
            graphData.push(item);
    });
    return graphData;
}

/*******************************************************************************
*                                                                              *
*                                     Misc                                     *
*                                                                              *
*******************************************************************************/

/**
 * Gets a color from the palette
 * @returns {string} Color in hex representation
 */
function getColorFromPalette(index) {
    const colors = ["#C0C0C0", "#808080", "#000000", "#CCFF00", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080"];
    //const color = colors[Math.floor(Math.random() * colors.length)];
    const color = colors[index%colors.length];
    return color;
}

/**
 * Draws both diagonals on the graph area
 * @returns {void}
 */
function drawDiagonals() {
    const svg = d3.select("svg");
    const graphWidth = svg.attr("width");
    const graphHeight = svg.attr("height");
    svg.append("line")
        .attr("stroke", "#000000")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", graphWidth)
        .attr("y2", graphHeight);
    svg.append("line")
        .attr("stroke", "#000000")
        .attr("x1", 0)
        .attr("y1", graphHeight)
        .attr("x2", graphWidth)
        .attr("y2", 0);
}

dscc.subscribeToData(drawViz, { transform: dscc.tableTransform });