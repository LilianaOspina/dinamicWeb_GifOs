//Constantes
const url = "https://api.giphy.com/v1/gifs/";
const api_key = "api_key=nWaJ8sC3BymicRtKJ3IIhZqFfjzMbSgK";
const endPoint_search = "search?" + api_key + "&q={text}&limit={num}&offset=0&rating=g&lang=en";
const endPoint_random = "random?" + api_key + "&tag=&rating=g";
const endPoint_trending = "trending?" + api_key + "&limit={num}&offset={num2}&rating=g";
const tagsRelated = "https://api.giphy.com/v1/tags/related/{text}?" + api_key;
const endPoint_upload = "https://upload.giphy.com/v1/gifs?" + api_key;
const endPoint_download = "https://api.giphy.com/v1/gifs/{id}" + "?" + api_key;

function get(selector, isList = false, parent = document) {
    result = isList ? parent.querySelectorAll(selector) : parent.querySelector(selector);

    if (result == null) console.log(selector + " doesn't exists");
    return result;
}

function listen(selector, evento, func) {
    items = get(selector, true);
    for (i = 0; i < items.length; i++) items[i].addEventListener(evento, func);
}

function display(selector, visible = null) {
    let element = get(selector);
    if (visible == null) visible = element.style.display == "" || element.style.display == " " || element.style.display == "none";

    visible = visible ? "flex" : "none";
    if (visible != element.style.display) element.style.display = visible;
}

function creaElemento(elemento, clase, padre) {
    nuevoElemento = document.createElement(elemento);
    nuevoElemento.className = clase;
    ubicacionElemento = padre.appendChild(nuevoElemento);
    return nuevoElemento;
}

function getQueryString(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
