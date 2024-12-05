//https://d3-graph-gallery.com/graph/wordcloud_size.html
//https://www.npmjs.com/package/d3.layout.cloud


let fontMin = 20;
let fontMax = 130;
let colorI = "#180e8a";
let colorE = "#030537";
let fontcolormax = "#ffffff";
let fontcolormed = "#5abce9";
let fontcolormin = "#0a198c";
let oldData = "";
let newData = "";


const handleInteraction = (val, dimensions) => {

    //console.log(val);
    const interactionId = "filter";

    // the interaction type - only FILTER is supported right now
    const FILTER = dscc.InteractionType.FILTER;

    //  console.log('concept',dimensions[0].id);
    let interactionData = {
        //concepts: [dimensionId],
        //values: [[value]]
        concepts: [dimensions[0].id],
        values: [[val]]
        //values: [["Cuentas de partidos políticos","Población Civil","Periodistas","Políticos","Activistas políticos","Medios Online","Cuentas vinculadas con política"]]
    };

    // send Looker Studio an instruction to filter other charts in the dashboard
    dscc.sendInteraction(interactionId, FILTER, interactionData);
};



function drawViz(data) {
    console.log('data',data);
    fontMin = data.style.minfont.value;
    fontMax = data.style.maxfont.value;
    colorI = data.style.colorinterior.value.color;
    colorE = data.style.colorexterior.value.color;
    fontcolormax = data.style.colormaspeso.value.color
    fontcolormed = data.style.colormedio.value.color
    fontcolormin = data.style.colormenospeso.value.color
    newData = JSON.stringify(data.tables.DEFAULT);
    /*
    if (oldData.length === 0) {
      metricmax = +data.tables.DEFAULT.rows[0][2];
      metricmin = +data.tables.DEFAULT.rows[data.tables.DEFAULT.rows.length - 1][2];
    }*/
    //Si trae la misma info no aplicar
    if (oldData == newData) {
        return;
    }
    oldData = newData;

    const dimensions = data.fields.tableDimension;
    d3.select("#svg").remove();

    // set the dimensions and margins of the graph
    var margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = dscc.getWidth() - margin.left - margin.right,
        height = dscc.getHeight() - margin.top - margin.bottom;


    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#9abfff")
        .style("color","black")
        .style("padding", "10px")
        .style("border-radius", "6px")
//        .style("border", "1px solid #ccc");

    // append the svg object to the body of the page
    var svg = d3.select("body").append("svg")
        .attr("id", "svg")
        .attr("width", width + margin.left + margin.right - 10)
        .attr("height", height + margin.top + margin.bottom - 10)
        //      .style("background","radial-gradient(rgb(24, 14, 138), rgb(3,5,55))")
        .style("background", "radial-gradient(" + colorI + "," + colorE + ")")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const dataMax = +data.tables.DEFAULT[0].tableMetric[0];
    const dataMin = +data.tables.DEFAULT[data.tables.DEFAULT.length - 1].tableMetric[0];


    const datos = data.tables.DEFAULT
        .filter(d => d.tableDimension[0] != null && d.tableDimension[1] != null) // Filtrar elementos no nulos
        .map(function (d) {
            let porcM = '';
            if (data.tables.DEFAULT.length >= 3) {
                porcM = (d.tableMetric[0] - dataMin) / (dataMax - dataMin);
            } else {
                porcM = 1;
            }
            const s = ~~d3.interpolateNumberArray([dataMin, fontMin], [dataMax, fontMax])(porcM)[1];
            return { text: d.tableDimension[0], size: s, tono: d.tableDimension[1], metric: d.tableMetric[0] };
        });

    var layout = d3.layout.cloud()
        .size([width, height])
        //    .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
        .words(datos)
        .padding(5)        //space between words
        .rotate(function (d, i) {
            if (i == 0) {
                //console.log('i0 '.concat(i, ' ', d.text));
                return 0;
            } else {
                //console.log('i '.concat(i, ' ', d.text));
                return ~~(Math.random() * 2) * 90;
            }
        })
        .fontSize(function (d) { return d.size; })      // font size of words
        //  .spiral('rectangular')
        .on("end", draw);
    layout.start();







    //    console.log('datosi',datos);
    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(datos) {

        let lengthDatos = datos.length;
        //    console.log("datos",datos);
        if (datos.length < 3) {
            //iColor=['#ffffff','#5abce9'];
            iColor = [fontcolormax, fontcolormed];
        } else {
            let tmpiColor = interpolarColores(fontcolormax, fontcolormed, Math.ceil(lengthDatos / 2));
            iColor = tmpiColor;
            tmpiColor = interpolarColores(fontcolormed, fontcolormin, Math.ceil(lengthDatos / 2));
            iColor.push(...tmpiColor);
        }

       // console.log('data', data);
       // console.log('datos', datos);
        //    console.log('words',datos);

        svg
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(datos, (d) => d.text.concat(d.size, d.tono))
            .enter().append("text")
            .style("font-size", function (d) { return d.size; })
            .style("fill", function (d, i) {
                //            console.log('i',i)
                return iColor[i];
            })
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; })
            .on('mouseover', function (d) {
                tooltip.style("visibility", "visible")
                    .text(`Metric: ${d.metric}`)  // Aquí puedes poner la información que quieras mostrar
                    .style("left", (d3.event.pageX - 25) + "px")
                    .style("top", (d3.event.pageY - 75) + "px");
            })
            .on('mousemove', function (event, d) {
                tooltip.style("left", (d3.event.pageX - 25) + "px")  // Ajusta horizontalmente a la derecha
                    .style("top", (d3.event.pageY - 75) + "px");  // Ajusta verticalmente un poco arriba
            })
            .on('mouseout', function () {
                tooltip.style("visibility", "hidden");
            })
            .on('click', function (d) {
                let val = this.textContent;
                //console.log('val',val, d.size);
                handleInteraction(val, dimensions);
            })




    }

    //    console.log('datosf',datos);

}


/**
 * Interpolar colores 
 * @param {string} colorInicial color inicial hex
 * @param {string} colorFinal color final hex
 * @param {number} numeroColores cantidad de pasos
 * @returns {object[]} Lista de colores
 */
// Función para interpolar entre dos colores hexadecimales
function interpolarColores(colorInicial, colorFinal, numeroColores) {
    // Convertir los colores hexadecimales a valores RGB
    var rInicial = parseInt(colorInicial.substring(1, 3), 16);
    var gInicial = parseInt(colorInicial.substring(3, 5), 16);
    var bInicial = parseInt(colorInicial.substring(5, 7), 16);

    var rFinal = parseInt(colorFinal.substring(1, 3), 16);
    var gFinal = parseInt(colorFinal.substring(3, 5), 16);
    var bFinal = parseInt(colorFinal.substring(5, 7), 16);

    // Calcular el paso de interpolación para cada componente RGB
    var pasoR = (rFinal - rInicial) / (numeroColores - 1);
    var pasoG = (gFinal - gInicial) / (numeroColores - 1);
    var pasoB = (bFinal - bInicial) / (numeroColores - 1);

    // Array para almacenar los colores interpolados
    var coloresInterpolados = [];

    // Generar los colores interpolados
    for (var i = 0; i < numeroColores; i++) {
        // Calcular los componentes RGB para el color actual
        var r = Math.round(rInicial + pasoR * i);
        var g = Math.round(gInicial + pasoG * i);
        var b = Math.round(bInicial + pasoB * i);

        // Convertir los componentes RGB de nuevo a hexadecimal y almacenar el color
        var colorInterpolado = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        coloresInterpolados.push(colorInterpolado);
    }

    return coloresInterpolados;
}

function getRandomColor() {
    //const colors = ["#C0C0C0","#808080","#000000","#CCFF00","#800000","#FFFF00","#808000","#00FF00","#008000","#00FFFF","#008080","#0000FF","#000080","#FF00FF","#800080"]
    const colors = ["#c767dc", "#dc67ab", "#76dc67", "#dc8c67", "#97dc67", "#dc7a67", "#dcaf67", "#6771dc", "#c3dc67", "#dc67b9", "#67dcbd", "#dcd267", "#67b9dc", "#dc67ce", "#a0dc67", "#7ddc67", "#67dcbb", "#dc6797", "#6797dc", "#bd67dc", "#a367dc", "#74de85", "#6cdd9e", "#dc6788", "#67dc9b", "#7a67dc", "#9b67dc", "#67dc98", "#dadc67", "#67dc7a", "#67b7dc", "#dc6776", "#dc6967", "#dc67da", "#6794dc", "#8067dc", "#67dc75", "#b9dc67", "#dcbd67"]
    let color = colors[Math.floor(Math.random() * 15)]
    return color;
};

dscc.subscribeToData(drawViz, { transform: dscc.objectTransform })
