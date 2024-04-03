var titlelink = [];
function drawViz(data) {

//  console.log("data",data);

  document.body.innerHTML = "";
  var body = document.body;

//  const titles = ['TITULO 1', 'TITULO 2'];
//  const dates = ['07/03/2024', '08/03/2024'];
//  const contents = ['Contenido de la tarjeta 1...', 'Contenido de la tarjeta 2...'];
//  const tagsList = [['#hash1', '#hash2', '#hash3'], ['#hash4', '#hash5', '#hash6']];


  var titles = []; 
  var contents = []; 
  var dates = []; 
  var tagsList = [];

//  console.log('data',data);
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
    titles.push(data.tables.DEFAULT.rows[i][0]);
    contents.push(data.tables.DEFAULT.rows[i][1]);
    dates.push(data.tables.DEFAULT.rows[i][2]);
    var tag = data.tables.DEFAULT.rows[i][3];
    titlelink.push(data.tables.DEFAULT.rows[i][4]);
    //-----------------------------
    //agregar el url [i][4];
//    console.log('tag', i, tag);
    if (tag.charAt(0) === ',') {
      tag = tag.substring(1);
    }
    if (tag) {
      if (tag.includes(",")) {
        tags = tag.split(',');
      } else {
        tags = [data.tables.DEFAULT.rows[i][3]];
      }

      tags = tags.filter(n => n);
      tagsList.push(tags);
    }
  }
 //console.log('titles',titles);
 //console.log('url',titlelink);
  const container = createCard(titles,dates,contents,tagsList,data.style);

  
  body.appendChild(container);

}

// Subscribe to data and style changes. Use the table format for data.
dscc.subscribeToData(drawViz, { transform: dscc.tableTransform });


function createCard(title, date, content, tags, style) {

//  var body = document.body;
  const container = document.createElement('div');
  container.classList.add('container');
  container.style.fontSize = style.contentsize.value + "px"; 
  container.style.fontFamily = style.contentfontfamily.value; 
  container.setAttribute("shape-rendering","crispEdges");
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
//    console.log("tag",i,tag);
      let pos = tag.indexOf('-');
      tag = tag.substring(0,pos);

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





