let recorderVideo = null;
let recorderGif = null;
let capture = null;
let isPlaying = true;
let video = "";
let gif = "";

//theme
get("#body").className = getQueryString("theme");
get("#logo").src = "./assets/images/gifOF_" + (getQueryString("theme") == "tema-noche" ? "logo_dark.png" : "logo.png");

//instrucciones y comienzo
function comenzar() {
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                width: 832,
                height: 434,
            },
        })
        .then((stream) => {
            capture = stream;

            recorderVideo = RecordRTC(stream, {
                type: "video",
                mimeType: "video/webm; codecs=vp8",
                disableLogs: true,
                frameRate: 3,
                quality: 10,
                width: 360,
                hidden: 240,
            });
            recorderGif = RecordRTC(stream, {
                disableLogs: true,
                type: "gif",
                frameRate: 3,
                quality: 10,
                width: 360,
                hidden: 240,
            });

            chequeo();
        });
}
// precaptura
function chequeo() {
    display("#mis-guifos", false);
    cambiar("Un Chequeo Antes de Empezar", false, true, false, true, false, false);
    video = get(".captura-video");
    video.srcObject = capture;
    video.play();
}
listen(".comenzar", "click", () => {
    comenzar();
});
listen(".repetir", "click", () => {
    comenzar();
});
//iniciar captura
async function recGif() {
    cambiar("Capturando Tu Guifo", false, true, false, false, true, false);
    await recorderVideo.startRecording();
    await recorderGif.startRecording();
    await startCron();
}
listen(".rec-video", "click", () => {
    recGif();
});

// detener captura
function stopGif() {
    videoOff();
    stopCron();
    get("#current-counter").innerHTML = current;
    cambiar("Vista previa", false, false, true, false, false, true);

    recorderGif.stopRecording();
    recorderVideo.stopRecording(function () {
        let contenedorPreview = get(".preview-gif");
        contenedorPreview.setAttribute("src", URL.createObjectURL(recorderVideo.getBlob()));
        recorderVideo.reset();
    });
}
listen(".stop-video", "click", () => {
    stopGif();
});

//UPLOAD GIF
async function uploadGif() {
    let blob = recorderGif.getBlob();
    let form = new FormData();
    form.append("file", blob, "myGif.gif");
    console.log(form.get("file"));

    display("#cont-captura", false);
    display("#upload", true);

    await fetch(endPoint_upload, {
        method: "POST",
        body: form,
    })
        .then(function (response) {
            if (response.ok) {
                let data = response.json();
                console.log(data);
                return data;
            }
        })
        .then(async function (data) {
            display("#upload", false);
            display("#download", true);
            gifUrl = await setStorage(data.data.id);
            get(".preview-download").setAttribute("src", gifUrl);

            console.log(gifUrl);
        })
        .catch(function (error) {
            console.log("OHH NO RAYOS!!", error.message);
        });
}
listen(".subir", "click", () => {
    uploadGif();
});

//copia enlace gif
function copiaPortapapeles() {
    let myCode = document.querySelector(".preview-download").src;
    let fullLink = document.createElement("input");

    document.body.appendChild(fullLink);
    fullLink.value = myCode;
    fullLink.select();
    document.execCommand("copy", false);
    fullLink.remove();

    alert("Gif copiado: " + fullLink.value);
}
listen("#copy-link", "click", () => {
    copiaPortapapeles();
});

// //download gif
async function download() {
    console.log(document.querySelector(".preview-download").src);

    let a = document.createElement("a");

    let response = await fetch(document.querySelector(".preview-download").src);
    let file = await response.blob();
    a.href = window.URL.createObjectURL(file);

    a.download = "myGif.gif";
    a.dataset.downloadurl = ["application/octet-stream", a.download, a.href].join(":");

    document.body.appendChild(a);
    a.click();
    a.remove();
}
listen("#download-file", "click", () => {
    download();
});

// apaga la camara
function videoOff() {
    vid = get(".captura-video");
    vid.pause();
    capture.getTracks()[0].stop();
    console.log("Vid off");
}
// play y pausa de gif
function videoControl() {
    let video = get(".preview-gif");
    if (isPlaying) {
        console.log("stop");
        video.pause();
        isPlaying = false;
    } else {
        console.log("play");
        isPlaying = true;
        video.play();
    }
}
listen("#videoControl", "click", () => {
    videoControl();
});

// descarga gif de API a DOM
async function setStorage(id) {
    endPoint = endPoint_download.replace("{id}", id);
    console.log(endPoint);

    let respuesta = await fetch(endPoint);
    let gif = await respuesta.json();
    localStorage.setItem(`gif-${id}.`, JSON.stringify(gif));

    return gif.data.images.fixed_height.url;
}

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
getStorage();

//UI
function cambiar(titulo, instrucciones, mainVideo, mainPreview, checkBar, recordingBar, previewBar) {
    get(".titulo-dinamico").innerHTML = titulo;

    display("#instrucciones", instrucciones == true);
    display("#cont-captura", instrucciones == false);

    display(".captura-video", mainVideo);
    display(".preview-gif", mainPreview);
    display(".cont-botones-check", checkBar);
    display(".cont-botones-recording", recordingBar);
    display(".cont-botones-preview", previewBar);
}
//CRONOMETRO

let cron;
const counter = get("#counter");
let current = 0;

function startCron() {
    let startTime = new Date().getTime();
    cron = setInterval(() => {
        let now = new Date().getTime();
        current = new Date(now - startTime).toISOString().substr(14, 8);
        counter.innerHTML = current;
        lastPrinted = current;
        console.log(current);
        get("#current-counter").innerHTML = current;
    }, 10);
    console.log(cron);
}
function stopCron() {
    clearInterval(cron);
}
