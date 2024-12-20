var titlelink = [];
function drawViz(data) {

 // console.log("data",data);

  document.body.innerHTML = "";
  var body = document.body;

  var titles = []; 
  var contents = []; 
  var dates = []; 
  var tagsList = [];
  titlelink = [];
  var sep = data.style.separador.value;
 // var regex = data.style.regex.value;
  const regex = {
    string: data.style.regex.value,  // La expresión regular como string
    group: data.style.grupo.value,                     // Número de grupo que deseas capturar
  }; 

  var mir = +data.style.minrange.value-1;
  const minrange = mir < 0 ? 0 : mir;
  var mar = +data.style.maxrange.value-1;
  let maxrange = mar < 1 ? 1 : mar;
  maxrange = maxrange > data.tables.DEFAULT.rows.length ? data.tables.DEFAULT.rows.length-1 : maxrange-1;
//  console.log("min",minrange);
//  console.log("max",maxrange);

  var tags;
//  for (var i = 0; i < 5; i++){
  var temp = [];
//  console.log('a',data.tables.DEFAULT.rows)
  for (let i = minrange; i < maxrange; i++) {
//    console.log('i',i)
    if ( typeof data.tables.DEFAULT.rows[i][0] == "undefined") {
      continue;
    }
    if ( data.tables.DEFAULT.rows[i][0] == null ) {
      titles.push('mención de redes sociales');
    }
    else {
      titles.push(data.tables.DEFAULT.rows[i][0]);
    }
    contents.push(data.tables.DEFAULT.rows[i][1]);
      var tempdate = fecha(data.tables.DEFAULT.rows[i][2])
      dates.push(tempdate);
  //  dates.push(data.tables.DEFAULT.rows[i][2]);
    var tag = data.tables.DEFAULT.rows[i][3];
    titlelink.push(data.tables.DEFAULT.rows[i][4]);
    

   if (data.style.separador.value ) {
    tags = tag.split(sep);
    tags = tags.filter(n => n);
    tagsList.push(tags);
   } else {
    tagsList.push(tag);
   }
    
}
  const container = createCard(titles,dates,contents,tagsList,data.style,regex);

  
  body.appendChild(container);

}

// Subscribe to data and style changes. Use the table format for data.
dscc.subscribeToData(drawViz, { transform: dscc.tableTransform });

function fecha(f) {
  let year = f.slice(0,4);
  let month = f.slice(4,6);
  let day = f.slice(6,8);


  return `${day}/${month}/${year}`;
}

function fechaA(f) {
  //YYYY/MM/DD  y DD/MM/YYYY twitter
  //YYYY/MM/DD  otros
  sep = f.includes('/') ? '/' : '-';
  spl = f.split(sep);

  let d = 0;
  let year = '';

    if ( spl[0].length == 4 ) {
      year = spl[0]
      d = 2;
    }

   if ( spl[2].length == 4 ) {
      year = spl[2]
      d = 0;
    }

  let day = spl[d];
  let month = spl[1];
  

  return `${day}/${month}/${year}`;

}

function createCard(title, date, content, tags, style, regex) {

//  regexStr = "(.*?)(\\s*-\\s*.*)";
//console.log('reegx',regex)
  const regexstr = new RegExp(regex.string, "g");

  
//  var body = document.body;
  const container = document.createElement('div');
  container.classList.add('container');
  container.style.fontSize = style.contentsize.value + "px"; 
  container.style.fontFamily = style.contentfontfamily.value; 
  container.setAttribute("shape-rendering","crispEdges");
  container.style.textRendering = "optimizeLegibility"; // Mejora la legibilidad del texto
  container.style.webkitFontSmoothing = "antialiased"; // Específico de WebKit
  container.style.fontSmoothing = "antialiased"; // General para todos los navegadores

//  .attr("shape-rendering","crispEdges")

  const containerTitle = document.createElement('h2');
  containerTitle.classList.add('container-title');
  containerTitle.textContent = 'Menciones';
  container.appendChild(containerTitle);


  for (let i = 0; i < title.length; i++) {
    const card = document.createElement('div');
    card.classList.add('card');

    const header = document.createElement('div');
    header.classList.add('header');

    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('title');
    const linkElement = document.createElement('a');
    linkElement.href = titlelink[i];
    linkElement.target = '_blank';
    linkElement.textContent = title[i];
    cardTitle.appendChild(linkElement);


    const cardDate = document.createElement('p');
    cardDate.classList.add('date');
    cardDate.innerHTML = `Fecha: <span class="bold">${date[i]}</span>`;

    header.appendChild(cardTitle);
    header.appendChild(cardDate);
    card.appendChild(header);

    const cardContent = document.createElement('p');
    cardContent.classList.add('content');
    //cardContent.textContent = content[i];
    cardContent.innerHTML = content[i];
    card.appendChild(cardContent);

    const tagsContainer = document.createElement('div');
    tagsContainer.classList.add('tags');

    
    if ( typeof tags[i] !== "undefined" && tags.length > 0) {
//      console.log('tags',tags)
//      console.log('tagsi',tags[i])
        for (var tag of tags[i]) {
          if (regex.string) {
            tag = [...tag.matchAll(regexstr)].map(match => match[regex.group].trim());
          } 

          const tagElement = document.createElement('span');
          tagElement.classList.add('tag');
          tagElement.textContent = tag;
          tagsContainer.appendChild(tagElement);
        }
    }

    card.appendChild(tagsContainer);
    container.appendChild(card);
  //  body.appendChild(container);
  }
  return container;
}





