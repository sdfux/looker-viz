let dimensions = [];
/**
 * Entry point for looker studio
 * @param {*} data The data to be graphed
 */
let oldData = "";
let newData = "";

let cantnodos = 10;
let offsetX = 50;
let offsetY = 50;


function drawViz(data) {
//eliminar nulos
data.tables.DEFAULT.rows = data.tables.DEFAULT.rows.filter((d,i) => d[0] != null && d[1] != null )
//console.log('data',data);
    
cantnodos = data.style.nodocant.value;
offsetX = data.style.offsetx.value;
offsetY = data.style.offsety.value;

newData = JSON.stringify(data.tables.DEFAULT.rows);
if (oldData == newData){
  //console.log("IGUALLLLLL");
  //return;
} 
oldData = newData;


    const body = document.getElementsByTagName("body")[0];
    const svgAttr = {
        "width": body.clientWidth,
        "height": body.clientHeight,
    };
    let svg = document.getElementById("svg");
    if(!svg) {
        svg = d3.select("body")
            .append("svg")
            .attr("width", svgAttr.width)
            .attr("height", svgAttr.height)
            .attr("viewBox", [0,0, svgAttr.width, svgAttr.height])
            .attr("id", "svg");
    } else{
        svg = d3.select("svg");
        //Limpiamos el espacio de trabajo
        document.getElementById("svg").innerHTML = "";
    }
    dimensions = data.fields.tableDimension.map( td => td.id);
    //drawDiagonals(svg);
    graphData(data);
//    console.info(data);
}



/*******************************************************************************
*                                                                              *
*                                   Graphics                                   *
*                                                                              *
*******************************************************************************/
/**
 * Graph the given data
 * @param {*} data  Table with the data
 */
function graphData(data) {
    console.log("Graphing data");
    const rows = data.tables.DEFAULT.rows;
    const transformedData = extractGraphData(rows);
    let links = extractLinks(transformedData);
    const nodes = extractNodes(transformedData);
    const minData = Math.min(...transformedData.map(i => i.value));
    const maxData = Math.max(...transformedData.map(i => i.value));
    const domain = {
        min: minData,
        max: maxData,
    };

    links = links.filter(n => n.source !== n.target)

    //console.log('links',links);
    //console.log('nodes',nodes);
    drawGraph(nodes, links);
    console.log("Draw finished");
}

/**
 * Dibujar la grafica
 * @param {*} nodes Nodos de la red
 * @param {*} domain Dominio de los datos
 */
function drawGraph(nodes, links){
    const svg = d3.select("svg");
    const width = svg.attr("width");
    const height = svg.attr("height");
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const minRadius = 10;
    const maxRadius = minRadius * 2;
    let categories = extractCategories(nodes);
//    const nCats = categories.length > 10 ? 10: categories.length;
    const nCats = categories.length > cantnodos ? cantnodos: categories.length;
    const maxStringLength = 20;
    //nodes = nodes.filter(n => n.category <= nCats).sort(n => n.r);
    const nodes1 = nodes.sort(n => n.r).filter(n => n.dim == "dim1").slice(0, nCats);
    const nodes2 = [];
    links = [];
    nodes1.forEach(n => {
        const found = nodes.filter(i => i.dim == "dim2" && n.category == i.category).sort(i => i.r).slice(0,5);
        let l = found.map( i => {
            return {
                source: n.id,
                target: i.id,
            }
        });
        links.push(...l);
        nodes2.push(...found);
    });
    nodes1.push(...nodes2);
    nodes = nodes1;
    const partX = width/nCats;
    const padding = 10;

    let link = svg
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
            //.attr("stroke", d => color(d.target.category))
            //.attr("fill", d => color(d.target.category))
            .attr("stroke", d => {
                const n = nodes.find( i => {
                    let found =  d.source == i.id
                    
                    return found;
                })
//                let c = getColorFromPalette(n.category-1) 
                return color(n.category)
            })
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",1.5)
            .attr("fill","none");

    //Graph the nodes
    let node = svg
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
            //.attr("r", d => d.dim == "dim1" ? maxRadius : minRadius)
            .attr("r", 10)
//            .attr("fill", d => color(d.category))
            .attr("fill", '#fff')

            .attr("stroke", "#fff")
//            .attr('cx',100)
//            .attr('cy',100)
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.2);
           /* .on("click", event => {
                const interactionId = "filter";
                //const dimensions = ["qt_e3x2jyldfd", "qt_uqsotyldfd"];
                const index = event.dim == "dim1" ? 0 : 1;
                const dimension = dimensions[index];
                const filter = dscc.InteractionType.FILTER;
                const interactionData = {
                    concepts: [dimension],
                    values: [[event.id]]
                };
                dscc.sendInteraction(interactionId, filter, interactionData);
            }); */


    node.append("title")
            .text(n => n.id);
    //Simulation
//        const found = nodes.filter(i => i.dim == "dim2" && n.category == i.category).sort(i => i.r).slice(0,5);
   // console.log('n1', nodes.filter( e => e.dim == 'dim1').map(i => i.category));
    //Math.min(width,height)/4
    
    
    //const puntos = distribuirPuntosCirculares(nCats,{x:width/2, y:height/2},200)
    const puntos = drawSpiral(nCats,300,(width/2)+offsetX,height/2+offsetY);



    //console.log('puntos',puntos);

    //console.log('nodes',nodes)
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-45))
        .force('x', d3.forceX().x(function (d,i) {
//console.log('--->',JSON.stringify(d))
        //    return (partX * (d.category-1)) + partX/2;
            const fx = puntos.find(item => item.category === d.category).x
            
            return fx; 
        }))
        .force('y', d3.forceY().y(function (d,i) {
            //return height/2;
           // console.log('y', puntos[0].y)
            const fy = puntos.find(item => item.category === d.category).y
            return fy;
        }))
        .force('collision', d3.forceCollide().radius(function (d) {
            return d.dim == "dim1" ? maxRadius + padding : minRadius + padding;
            //return scalerRadius(d.r);
        }))
        .on('tick', ticked)
        .on("end", ended);

    function ended() {
        const fontSize = 14;
        const textElements = svg.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("shape-rendering","crispEdges")
            .attr("stroke","none")
            .attr("x", i => i.x - i.id.length*fontSize/4)
            .attr("y", i => i.y)
            .text(i => i.id.length < maxStringLength ? i.id : i.id.substring(0,maxStringLength) + "...")
            .attr("class", d => d.dim)
            .attr("opacity", 1.0)
            .attr("font-size", fontSize+"px")
            .attr("fill", d => color(d.category))
            .on("click", event => {
                const interactionId = "filter";
                //const dimensions = ["qt_e3x2jyldfd", "qt_uqsotyldfd"];
                const index = event.dim == "dim1" ? 0 : 1;
                const dimension = dimensions[index];
                const filter = dscc.InteractionType.FILTER;
                const interactionData = {
                    concepts: [dimension],
                    values: [[event.id]]
                };
                dscc.sendInteraction(interactionId, filter, interactionData);
            });
    }

    function ticked() {

    
        link
        //estas son para las lineas rectas:
            //.attr("x1", d => d.source.x)
            //.attr("y1", d => d.source.y)
            //.attr("x2", d => d.target.x)
            //.attr("y2", d => d.target.y);



        //estas son para las lineas con doble curva como aqui https://observablehq.com/@rusackas/force-graph-with-bezier-links:
       //     .attr("d", d => {
       //   return `
       //     M 
       //       ${d.source.x} ${d.source.y} 
       //     C 
       //       ${(d.source.x + d.target.x) / 2} ${d.source.y} 
       //       ${(d.source.x + d.target.x) / 2} ${d.target.y} 
       //       ${d.target.x} ${d.target.y}
       //   `
       //     });


        //estas son para las curvas:
            .attr("d", d => {
            // Calcula el punto medio para la curva
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);

            // Usa una curva Bézier para suavizar la línea: M = move to, A = arc
            // Puedes ajustar 'dr' para cambiar la curvatura
            return `M
                        ${d.source.x},${d.source.y}
                    A
                        ${dr},${dr}
                        0 0,1
                        ${d.target.x},${d.target.y}
                    `;
        })


        node
            .attr('cx', n => n.x)
            .attr('cy', n => n.y);
        /*var u = d3.select('svg')
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr('r', function (d) {
                return scalerRadius(d.r);
            })
            .style('fill', function (d) {
                return colorScale[d.category];
            })
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            });*/
    }
    //Zoom
    const zoom = d3.zoom()
        .scaleExtent([1, 2])
        .on("zoom", e => {
            svg.attr("transform", d3.event.transform);
        });
    //svg.call(zoom);

}

/*******************************************************************************
*                                                                              *
*                 Data extraction and transformation functions                 *
*                                                                              *
*******************************************************************************/
/**
 * Extracts categories from nodes
 * @param {object[]} nodes Array of nodes
 * @returns {int[]} Unique categories
 */
function extractCategories(nodes) {

    const uniqueCategories = [];
    nodes.forEach(node => {
        if (!uniqueCategories.includes(node.category)) {
            uniqueCategories.push(node.category);
        }
    });
    return uniqueCategories;
}

/**
 * Transforms arrays into objects
 * @param {object[]} data Arreglos
 * @returns {object[]} Objetos
 */
function extractGraphData(data) {
    //data 0:[tema] 1:[subtema] 2:[recordcount]
//    console.log('data',data);
    //const graphData = data.filter(i => i[0] !== null && i[1]!= null)
    const graphData = data.filter(i => i[0])
        .map(item => {
            return {
                dim1: item[0],
                dim2: item[1],
                value: item[2],
            };

    });
    return graphData;
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
 * Extract nodes from data
 * @param {object[]} data Data as object
 * @returns {object[]} Nodes
 */
function extractNodes(data) {
    let category = 1;
    const nodeInfo = [];
    const nodes = [];
    data.forEach(i => {
        let node1 = nodes.find(n => n.id === i.dim1);
        let currnNode = nodeInfo.find(c => c.id === i.dim1);
        if(!currnNode) {
            currnNode = {
                id: i.dim1,
                category: category++,
            };
            nodeInfo.push(currnNode);
        }
        if(!node1) {
            node1 = {
                id: i.dim1,
                category: currnNode.category,
                r: 0,
                dim: "dim1",
            };
            nodes.push(node1);
        }
        node1.r += +i.value;
        let node2 = nodes.find(n => n.id == i.dim2);
        if(!node2) {
            node2 = {
                id: i.dim2,
                category: currnNode.category,
                r: +i.value,
                dim: "dim2",
            };
            nodes.push(node2);
        }
    });
    return nodes;
}

/*******************************************************************************
*                                                                              *
*                                 Miscellaneous                                *
*                                                                              *
*******************************************************************************/
/**
 * Draw big diagonals in the svg
 * @param {*} svg The svg
 */
function drawDiagonals(svg) {
    const width = svg.attr("width");
    const height = svg.attr("height");
    svg.append("line")
        .attr("stroke", "#000")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", height);
    svg.append("line")
        .attr("stroke", "#000")
        .attr("x1", 0)
        .attr("y1", height)
        .attr("x2", width)
        .attr("y2", 0);
}

/**
 * Obtiene un numero aleatorio entre los rangos indicados
 * @param {int} start  Inicio del rango
 * @param {int} stop Fin del rango
 * @returns {int} Numero aleatorio
 */
function getRandomInteger(start, stop) {
    return Math.floor(Math.random() * (stop - start + 1) + start);
}

function getColorFromPalette(index) {
    //console.log(index);
    const colors = ["#C0C0C0", "#808080", "#000000", "#CCFF00", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000", "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080"];
    //const color = colors[Math.floor(Math.random() * colors.length)];
    const color = colors[index%colors.length];
    return color;
}
/**
 * Distribuir puntos en una circunferencia.
 * @param {int} cantidad Cantidad de puntos en el perimetros.
 * @param {{x:int , y:int}} centro Centro del perimetro donde se colocaran los puntos.
 * @param {int} radio Radio del perimetro.
 * @returns {[{x:int,y:int}]} Arreglo con puntos x,y.
 */
function distribuirPuntosCirculares(cantidad, centro, radio) {
    const puntos = [];
    let category = 1;
    // Dibuja primero un punto en el centro si la cantidad es mayor a 3
    if (cantidad > 3 || cantidad == 1) {
        puntos.push({ x: centro.x, y: centro.y, category: category });
        category = ++category;
        cantidad -= 1; // Ajusta la cantidad para el cálculo de los puntos circulares
    }

    for (let i = 0; i < cantidad; i++) {
        // Calcular el ángulo en radianes para el punto actual
        const angulo = (i / cantidad) * (Math.PI * 2);
        const x = ~~(centro.x + radio * Math.cos(angulo));
        const y = ~~(centro.y + radio * Math.sin(angulo));
        puntos.push({ x, y, category });
        category = ++category;
    }
    return puntos;
}

/**
 * Distribuir puntos en una circunferencia.
 * @param {int} n Cantidad de puntos en el perimetros.
 * @param {int} diameter Diametro del perimetro.
 * @param {int} centerX Centro del canvas x.
 * @param {int} centerY Centro del canvas y.
 * @returns {[{x:int,y:int}]} Arreglo con puntos x,y.
 */
function drawSpiral(n, diameter, centerX, centerY) {
//        var centerX = canvas.width / 2;
//        var centerY = canvas.height / 2;

        var distanceBetweenCenters = diameter + 5; // Diámetro + padding
        var b = distanceBetweenCenters / (2 * Math.PI) / 2; // Hacemos que 'b' sea menor para acercar más los círculos

        var circles = []; // Almacenar las posiciones de los centros de los círculos

        // Función para verificar si un círculo se superpone con otros círculos
        function checkCollision(x, y) {
            for (var i = 0; i < circles.length; i++) {
                var dx = circles[i][0] - x;
                var dy = circles[i][1] - y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < diameter) {
                    return true; // Colisión detectada
                }
            }
            return false; // Sin colisión
        }

        // Dibuja cada círculo
        let i = 1;
        while ( circles.length <= n-1) {
            var theta = i * (Math.sqrt(distanceBetweenCenters / b) / Math.sqrt(i));
            var r = b * theta;

            var x = centerX + r * Math.cos(theta);
            var y = centerY + r * Math.sin(theta);

            // Verificar colisiones
            if (!checkCollision(x, y)) {
                i == 1 ? y = y + 55: y;
                i == 1 ? x = x + 70: x;
                circles.push({x:x, y:y, category: i}); // Si no hay colisión, agregamos las coordenadas al arreglo
            }
            i = ++i;
        }
        //console.log(circles);
        return circles;
}

dscc.subscribeToData(drawViz, {transform: dscc.tableTransform});
