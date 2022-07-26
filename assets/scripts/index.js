//THEMES
function cambiaTema(tema) {
    get("#body").className = tema;
    get("#link-captura").setAttribute("href", "captura.html?theme=" + tema);
    get("#logo").src = "./assets/images/gifOF_" + (tema == "tema-dia" ? "logo.png" : "logo_dark.png");
    display("#menu-temas", false);
}
listen(".sailor-day", "click", () => {
    cambiaTema("tema-dia");
});
listen(".sailor-night", "click", () => {
    cambiaTema("tema-noche");
});
listen("#flecha-menu-temas", "click", () => {
    display("#menu-temas");
});

//MIS GUIFOS
function showMisGuifos(id) {
    var e = document.getElementById(id);
    if (e.style.display == "block" || e.style.display == "") {
        e.style.display = "none";
        display("#mis-guifos-home", true);
    } else {
        e.style.display = "block";
        display("#mis-guifos-home", false);
    }
}
listen(".mis-guifos", "click", () => {
    showMisGuifos("home");
    getStorage();
});

listen(".ver-mas", "click", (sender) => {
    mostrarResultado(document.documentElement.parentNode.activeElement.attributes[0].ownerElement.previousElementSibling.alt);
    console.log(get(".hashtag", false, sender.target.parentNode));
});

//TRENDING
async function contenidoTendencias(endPoint, limit, offset) {
    let respuesta = await fetch(url + endPoint.replace("{num}", limit).replace("{num2}", offset));
    let datosFetch = await respuesta.json();

    for (i = 0; i < get(".cuadro", true).length; i++) {
        let imgUrl = datosFetch.data[i].images.fixed_height.url;
        console.log(imgUrl);
        let imgTitle = datosFetch.data[i].title.substr(0, 15);

        let insertImg = get(".gifs", true)[i];
        insertImg.setAttribute("src", imgUrl);
        insertImg.setAttribute("alt", imgTitle);

        get(".hashtag", true)[i].innerHTML = imgTitle;
    }
}
contenidoTendencias(endPoint_trending, 4, 0);
//escucha boton cerrar y carga nuevo gif random de tendencias
listen(".button-close", "click", async (sender) => {
    let min = 1;
    let max = 5000;
    let random = Math.floor(Math.random() * (+max - +min)) + +min;

    let oldGif = sender.target.parentNode.nextElementSibling;
    console.log(oldGif);

    let respuesta = await fetch(url + endPoint_trending.replace("{num}", 1).replace("{num2}", random));

    let datosFetch = await respuesta.json();

    let imgUrl = datosFetch.data[0].images.fixed_height.url;
    let imgTitle = datosFetch.data[0].title.substr(0, 5);

    oldGif.removeAttribute("src");
    oldGif.setAttribute("src", imgUrl);

    get(".hashtag", false, oldGif.parentNode).innerHTML = imgTitle;
});

async function buscarDatos(texto, limit) {
    endPoint = endPoint_search.replace("{text}", texto).replace("{num}", limit);
    let respuesta = await fetch(url + endPoint);
    let datosFetch = await respuesta.json();
    return datosFetch;
}
async function buscaTags(texto) {
    endPoint = tagsRelated.replace("{text}", texto);
    console.log(endPoint);

    let respuesta = await fetch(endPoint);
    let datosFetch = await respuesta.json();
    return datosFetch;
}

async function titulosSugeridos() {
    let texto = get("#inputBusqueda").value;

    get("#lupita-buscar").disabled = texto.length == 0;

    //reset
    display("#hoy-te-sugerimos", true);
    display(".cont-tags", texto !== "");
    display("#cont-busqueda", texto !== "");
    //datos
    datosFetch = await buscaTags(texto);
    let contBusquedasSugeridas = get("#cont-busqueda");
    contBusquedasSugeridas.innerHTML = "";

    for (i = 0; i <= 2; i++) {
        let insertaTituloSugerido = creaElemento("button", "busqueda button-grey", contBusquedasSugeridas);
        insertaTituloSugerido.addEventListener("click", resultadoSugerido);
        insertaTituloSugerido.innerHTML = datosFetch.data[i].name;
        tagsSugerencias = get(".tags", true)[i];
        tagsSugerencias.innerHTML = datosFetch.data[i].name;
        tagsSugerencias.addEventListener("click", resultadoSugerido);
    }
}
listen("#inputBusqueda", "input", () => {
    titulosSugeridos();
});

function resultadoSugerido(sender) {
    mostrarResultado(sender.target.textContent);
    display("#cont-busqueda", false);
    display("#hoy-te-sugerimos", false);
}

async function mostrarResultado(texto) {
    datosFetch = await buscarDatos(texto, 14);
    let contPadre = get(".cont-tendencias");
    contPadre.innerHTML = "";

    let tituloBloque = creaElemento("h2", "titulo-bloques m-top", contPadre);
    let contCuadros = creaElemento("div", "cont-cuadros grid-cont", contPadre);
    tituloBloque.innerHTML = texto;

    for (i = 0; i < datosFetch.data.length; i++) {
        let imgUrl = datosFetch.data[i].images.fixed_height.url;
        let imgWidth = datosFetch.data[i].images.fixed_height.width;
        let imgTitle = datosFetch.data[i].title.substr(0, 15);

        let creacionCuadros = creaElemento("div", "cuadro", contCuadros);
        creacionCuadros.className = imgWidth <= 280 ? "col-fix cuadro" : "col-6 cuadro";
        let creaImg = creaElemento("img", "gifs", creacionCuadros);
        creaImg.setAttribute("src", imgUrl);
        creaImg.setAttribute("alt", imgTitle);
        let tituloGif = creaElemento("h3", "hashtag2", creacionCuadros);
        tituloGif.innerHTML = "#" + imgTitle;
    }
}

function buscar() {
    let texto = get("#inputBusqueda").value;
    mostrarResultado(texto);
    display("#cont-busqueda", false);
    display("#hoy-te-sugerimos", false);
}
listen("#lupita-buscar", "click", () => {
    buscar();
});

// muestra los gif del localStorage
function getStorage() {
    let contPadreGifitos = get(".cont-mis-guifos");
    let contCuadros = creaElemento("div", "cont-cuadros grid-cont", contPadreGifitos);

    for (i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith("gif-")) {
            let value = localStorage.getItem(key);
            let gifito = JSON.parse(value);

            let urlGifito = gifito.data.images.fixed_height.url;
            let imgWidth = gifito.data.images.fixed_height.width;

            let creacionCuadros = creaElemento("div", "cuadro", contCuadros);
            creacionCuadros.className = imgWidth <= 280 ? "col-fix cuadro" : "col-6 cuadro";
            let creaImg = creaElemento("img", "gifs", creacionCuadros);
            creaImg.setAttribute("src", urlGifito);
        }
    }
}
