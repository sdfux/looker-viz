let dimensions = [];
let showDim2 = null;
let useNode0 = true;
function drawViz(data) {
    //eliminar nulos
    data.tables.DEFAULT.rows = data.tables.DEFAULT.rows.filter((d,i) => d[0] != null && d[1] != null )
    console.log('data',data);

    //0 para que siempre se vea, negativo no visible
    showDim2 = data.style.showNode2.value;

    useNode0 = data.style.useNode0.value;

//    console.log('data',data)
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
    
    dimensions = data.fields.tableDimension.map(td => td.id);
    graphCluster(data);
    console.info("Graph finished");
}

/**
 * Graph data in cluster view
 * @param {*} data
 */
function graphCluster(data) {
    const nrows = 200;
    const rows = data.tables.DEFAULT.rows.slice(0, nrows);
    const transformedData = extractGraphData(rows);
//    console.log('transformedData',transformedData);
    const nodes = extractNodes(transformedData);
//    console.log('nodes',nodes);
    const links = extractLinks(transformedData);
//    console.log('links',links);
    const minData = Math.min(...transformedData.map( i => i.value));
    const maxData = Math.max(...transformedData.map( i => i.value));
    const domain= {
        min: minData,
        max: maxData,
    };

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
    
    //-----
        // Agrega un contenedor <g> para los elementos que serán zoomables
    const zoomableLayer = svg.append('g')
        .attr('class', 'zoomable-layer');

        // Inicializa el zoom y lo aplica al SVG
    const zoom = d3.zoom()
        .scaleExtent([.1, 40]) // Establece los límites de zoom
        .translateExtent([[-1000, -1000], [width+1000, height+1000]])
        .on('zoom', (event) => {
            //console.log('d3',d3.event.transform);
            zoomableLayer.attr('transform', d3.event.transform);
            //0 para que siempre se vea, negativo no visible
//            console.log('showdim2',showDim2);
            if (showDim2 >= 0 ) {
            zoomableLayer.selectAll(".dim2") //si la classe es dim2 entonces mostrar si zoom(transform.k) es mayor que 3
                .style("opacity", d3.event.transform.k > showDim2 ? .6 : 0)};
        });
    svg.call(zoom);

    
    
    let link = zoomableLayer
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
            .style("stroke", "#dfdfdfb7");
    




    let node = zoomableLayer
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
            })
//        .call(dragHandler);

    node.append("title")
        .text(d => d.id);


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
//        const textElements = svg.selectAll("text")
        const textElements = zoomableLayer.selectAll(".dim1, dim2")
            .data(nodes)
            .enter()
            .append("text")
            .attr("x", i => i.x - i.id.length*fontSize/4)
            .attr("y", i => i.y)
            .text(i => i.id)
//            .attr("opacity", 0.6 )
            .attr("opacity", i => i.dim == "dim1" ? .6 : 0) // asignamos class, para poder mostrar u ocultar dim2 cuando llegue a cierto zoom
            .attr("class", i => i.dim ) // asignamos class, para poder mostrar u ocultar dim2 cuando llegue a cierto zoom
            .attr("font-size", fontSize+"px")
//            .attr("fill", "#000")
            .attr("fill", i => i.dim == "dim1" ? "#000" : "#808080") // asignamos class, para poder mostrar u ocultar dim2 cuando llegue a cierto zoom
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

           /* 
            const textElementsDim2 = zoomableLayer.selectAll(".dim2")
            .data(nodes.filter(i => i.dim == "dim2"))
            .enter()
            .append("text")
            .attr("x", i => i.x - i.id.length*fontSize/4)
            .attr("y", i => i.y)
            .text(i => i.id)
            .attr("opacity", 0)
            .attr("class", i => i.dim ) // asignamos class, para poder mostrar u ocultar dim2 cuando llegue a cierto zoom
            .attr("font-size", fontSize+"px")
            .attr("fill", "#000")
        
            */

        //Como  al sacar solamente el bbox por el zoomableLayer.selectAll(node)
        //no estaba trayendo el bbox mas que de el primer objeto que encontraba,
        //y si se hacia por el grupo, el bbox salia muy grande ya que el texto de dim2 es muy grande(al menos ahorita que se usaba la descripcion)
        //entonces se selecciono solo el .node y .dim1, y se hizo una iteracion con cada uno
        //para poder sacar el bbox real.
        //--------Zoom para que se vea todo.------
        const bodyWidth = dscc.getWidth()-50;
        const bodyHeight = dscc.getHeight()-50;
        const nodesAndText = zoomableLayer.selectAll(".node, .dim1");
        const bbox = nodesAndText.node().getBBox();
        nodesAndText.each(function(){
            const nodeBBox = this.getBBox();
            bbox.x = Math.min(bbox.x, nodeBBox.x);
            bbox.y = Math.min(bbox.y, nodeBBox.y);
            bbox.width = Math.max(bbox.width, nodeBBox.x + nodeBBox.width - bbox.x);
            bbox.height = Math.max(bbox.height, nodeBBox.y + nodeBBox.height - bbox.y);
        });
//        console.log('bbox',bbox)
        
        const scaleFactor = Math.min(bodyWidth / bbox.width, bodyHeight / bbox.height);
        const offsetX = (bodyWidth - bbox.width * scaleFactor) / 2 - bbox.x * scaleFactor;
        const offsetY = (bodyHeight - bbox.height * scaleFactor) / 2 - bbox.y * scaleFactor;
        let zoomTransform = d3.zoomIdentity.translate(offsetX, offsetY).scale(scaleFactor);

        //Esta linea es para que se aplique el zoom al "zoom handler", si no lo aplicas
        //a la hora de usar el scroll se "resetea", osea comienza desde donde se crea (o donde se quedó la ultima vez)
        svg.transition().duration(2000).call(zoom.transform, zoomTransform);


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
    //aqui poner un foreach par agregar un dim0 a todos los dim 1;
    //revisar desde data como se va transformando para poder gregar el dim0
    data.forEach(i => {
        let link = {
            source: i.dim1,
            target: i.dim2,
            value: i.value,
        }
        links.push(link);
        if (useNode0) {
            link = {
                source: "dim0",
                target: i.dim1,
                value: 1
            }
            links.push(link);
        };
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
    if (useNode0) {
        nodes.push({ id: "dim0", group: 0, r: 10, dim: "dim0" });
    };
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
