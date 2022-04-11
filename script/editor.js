let result = "{\n";
let totalBracket = ["}"];
let zoomTextArea;
let saveFlag;
let focus;
let level = 1;
const textArea = document.getElementById("result");
const showResult = document.getElementById("show-resalt");
const popup = document.getElementById("popup");
const savePopup = document.getElementById("popup-save");
const showZoomArea = document.getElementById("show-zoom");
const zoomButtons = document.getElementById("zoom-buttons");
const form = document.getElementById("form");
const closePopup = document.getElementById("form-close");
const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const area = document.getElementById("show-zoom");
const closeBtn = document.getElementById("close");
const loadBtn = document.getElementById("load-json");
const resetBtn = document.getElementById("reset");
const resetZoomBtn = document.getElementById("reset-zoom");
const saveBtn = document.getElementById("save");
const sendBtn = document.getElementById("send");
const zoomBtn = document.getElementById("zoom");
const changeZoom = document.getElementById("changeSize");
const loadContainer = document.getElementById("holder-load");
const resultContainer = document.getElementById("holder-result");
const random = getRandom();
const PageName = "MongoQuery_db" +`${random}`;
let a ='"';

// Заменяет одинарные кавычки на двойные
// str.replace(/'/g, '"')


// Функция проверки и добавления кавычек
function checkQuotes() {
    let split = textArea.value.split("");
   let arrrayfrom = Object.entries(textArea.value)
   debug(arrrayfrom)
    let array =[];

// //     for (key in textArea.value) {
// //  array.push(key);

// //       }
// //       debug(`${array.length}-----array`);
  

    for (let i =0;i<split.length;i++){
        if( split[i] === "\""){
array.push(split[i]);
        }
    }
    debug(`${array.length}-----array`);
    if(array.length% 2 == 0) {
        debug("кавычек хватает")} else {
            debug("кавечек не хватает")
        } 
// for (let i =0;i<split.length;i++){
//     if( split[i] === "{" || split[i] === "}"){
// array.push(split[i]);
//     }
// }
// debug(`${array.length}-----array`);
// debug(`${array}-----array`);
// if(array.length% 2 == 0) {
//     debug("скобок хватает")} else {
//         debug("скобок не хватает")
//     } 

}

// Функция генерации случайного числа
function getRandom() {
    return Math.random();
  }

// Функция проверки Json
function process(obj, destination) {
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        result += "\t".repeat(level);
        result += '"' + keys[i] + '": ';
        switch (typeof obj[keys[i]]) {
            case "object":
                if (Array.isArray(obj[keys[i]])) {
                    level++;
                    result += "[\n";
                    if (i !== keys.length - 1) {
                        totalBracket.push("],");
                    } else {
                        totalBracket.push("]");
                    }
                    process(obj[keys[i]], destination);
                } else {
                    if (obj[keys[i]] === null || obj[keys[i]] === undefined) {
                        result += obj[keys[i]];
                        if (i !== keys.length - 1) {
                            result += ",";
                        }
                        result += "\n";
                    } else {
                        level++;
                        result += "{\n";
                        if (i !== keys.length - 1) {
                            totalBracket.push("},");
                        } else {
                            totalBracket.push("}");
                        }
                        process(obj[keys[i]], destination);
                    }
                }
                break;
            default:
                if (typeof obj[keys[i]] === "string") {
                    result += '"' + obj[keys[i]] + '"';
                } else {
                    result += obj[keys[i]];
                }
                if (i !== keys.length - 1) {
                    result += ",";
                }
                result += "\n";
                break;
        }
        destination.value = result;
    }
    level--;
    result += "\t".repeat(level);
    result += `${totalBracket.pop()}\n`;
    result = result.replace(/"\d": /g, "");
    destination.value = result;
    inArr = false;
}

// Функция запуска проверки Json
function load(source, input) {
    let err;
    let data;
    if (source.value === "Self test OK" && input.value === "Self test OK") {
        data = JSON.parse(source.value);
        result = "{\n";
        level = 1;
        totalBracket = ["}"];
        if (input !== showResult) {
            source.value = "";
        }
        showResult.value = "";
        process(data, input);
    } else {
        try {
            data = JSON.parse(source.value);
            result = "{\n";
            level = 1;
            totalBracket = ["}"];
            if (input !== showResult) {
                source.value = "";
            }
            showResult.value = "";
            process(data, input);
        } catch (error) {
            let err = error;
            if (source.value === "") {
                showResult.value = "С сервера пришла пустая строка\n";
                showResult.value += err;
            } else {
                showResult.value = err;
            }
        }
    }
}
// Функция начала отправки файла в Back
var start = function () {
    var wsImpl = window.WebSocket || window.MozWebSocket;
    debug("connecting to server ..");
    window.ws = new wsImpl("ws://192.168.0.9:2020/");
    // when data is comming from the server, this metod is called
    // когда данные поступают с сервера, этот метод вызывается
    ws.onmessage = function (evt) {
        var incomingmsg = evt.data;
        let addrmsg = incomingmsg.split("|", 2);
        let addr = addrmsg[0];
        let msg = addrmsg.length > 1 ? addrmsg[1] : "";
        let func = msgMap.get(addr);
        if (func !== undefined) {
            func(msg);
            load(showResult, showResult);
        }
    };

    // when the connection is established, this method is called
    // когда соединение установлено, этот метод вызывается
    //
    ws.onopen = function () {
        debug(".. connection open");
        ws.send("[" + PageName + "]");
        // либо ответ либо выводится Self test OK
        ws.send("WSS:[" + PageName + "]ANSWER|Self test OK");
    };
    ws.onclose = function () {
        debug(".. connection closed");
    };
};

// Когда загрузилась страница запускаем Функцию старт
window.onload = start;

//Функция дебаг
function debug(msg) {
    console.log(msg);
    showResult.value += msg + "\n";
}

// new Map() – создаёт коллекцию.
let msgMap = new Map();
msgMap.set("PING", setPING);
msgMap.set("ANSWER", setANSER);

// Функция вывода сообщения в окно результата
function setANSER(msg) {
    // Result это окно вывода результата
    console.log("Response: " + msg);
    showResult.value = msg;
}

function setPING(msg) {
    if (subjects.has(msg)) {
        let currTime = new Date();
        let deltaTime = (
            (currTime - subjects.get(msg).lastPingTime) /
            1000.0
        ).toFixed(3);
        subjects.get(msg).lastPingTime = currTime;
    }
}

// Функция отправки запроса
function SendQuery_click() {
    let s = textArea.value;
    let msg = s.replaceAll("\n", " ");
    showResult.value = "";

    let query =
        "MONGO:db" + msg + " WSS:[" + PageName + "]ANSWER| %@db.RESULT%";
    ws.send(query);
}

// Функция закрытия модального окна по кнопке Esc
function closePopupEsc(evt) {
    if (evt.keyCode === 27) {
        if (savePopup.classList.contains("d-flex")) {
            savePopup.classList.remove("d-flex");
            savePopup.classList.add("d-none");
        } else {
            popup.classList.remove("d-block");
            popup.classList.add("d-none");
        }
    }
}

// Функция открытия модального окна
function openPopUp(input) {
    popup.classList.add("d-block");
    if (input === textArea) {
        area.value = textArea.value;
    } else {
        area.value = showResult.value;
    }
    zoomTextArea = input;
}

// Функция сохранения при выходе
function saveValueTextArea() {
    savePopup.className =
        "overlay d-flex align-items-center justify-content-center";
}

// Функция закрытия модального окна
function closePopUp() {
    if (saveFlag === true) {
        popup.classList.remove("d-block");
        popup.classList.add("d-none");
    } else {
        saveValueTextArea();
    }
    saveFlag = false;
}

// Функция проверки на каком елементе фокус
function checkFocus(value) {
    if (value === loadContainer) {
        focus = loadContainer;
    } else {
        focus = resultContainer;
    }
}

// функция переключения размеров textArea
function changeSizeTextArea() {
    if (
        loadContainer.classList.contains("col-lg-3") ||
        resultContainer.classList.contains("col-lg-3")
    ) {
        if (loadContainer.classList.contains("col-lg-3")) {
            loadContainer.classList.remove("col-lg-3");
            loadContainer.classList.add("col");
        } else {
            resultContainer.classList.remove("col-lg-3");
            resultContainer.classList.add("col");
        }
    } else {
        if (focus === loadContainer) {
            resultContainer.classList.add("col-lg-3");
            resultContainer.classList.remove("col");
        } else {
            loadContainer.classList.add("col-lg-3");
            loadContainer.classList.remove("col");
        }
    }
}
    
popup.addEventListener("click", (e) => {
console.log(e.target.id,"e.target.id")
   if(e.target.id == popup.id) {
          popup.classList.remove("d-block");
           popup.classList.add("d-none");
   }
   if(e.target.id == savePopup.id) {
    savePopup.classList.remove("d-flex");
    savePopup.classList.add("d-none");
}
});

document.addEventListener("keyup", (evt) => {
    if (!popup.contains(evt.target)) {
        popup.classList.remove("d-block");
        popup.classList.add("d-none");
    }
    closePopupEsc(evt);
});

yesBtn.addEventListener("click", () => {
    zoomTextArea.value = area.value;
    savePopup.classList.remove("d-flex");
    savePopup.classList.add("d-none");
    popup.classList.remove("d-block");
    popup.classList.add("d-none");
});

noBtn.addEventListener("click", () => {
    savePopup.classList.remove("d-flex");
    savePopup.classList.add("d-none");
    popup.classList.remove("d-block");
    popup.classList.add("d-none");
});

closePopup.addEventListener("click", () => {
    savePopup.classList.remove("d-flex");
    savePopup.classList.add("d-none");
});

textArea.addEventListener("focus", () => {
    checkFocus(loadContainer);
});
showResult.addEventListener("focus", () => {
    checkFocus(resultContainer);
});

changeZoom.addEventListener("click", () => {
    changeSizeTextArea(textArea);
});

saveBtn.addEventListener("click", () => {
    zoomTextArea.value = area.value;
    saveFlag = true;
});

resetZoomBtn.addEventListener("click", () => {
    area.value = "";
});

closeBtn.addEventListener("click", closePopUp);

zoomBtn.addEventListener("click", () => {
    if (focus === loadContainer) {
        openPopUp(textArea);
    } else {
        openPopUp(showResult);
    }
});

sendBtn.addEventListener("click", SendQuery_click);

resetBtn.addEventListener("click", () => {
    textArea.value = "";
    showResult.value = "";
});

loadBtn.addEventListener("click", () => {
    load(textArea, textArea);
    checkQuotes();
});

textArea.addEventListener("keydown", function (zEvent) {
    if (zEvent.key === "Tab") {
        zEvent.preventDefault();
        let start = this.selectionStart;
        let end = this.selectionEnd;
        this.value =
            this.value.substring(0, start) + "\t" + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
    }
});

document.addEventListener("keydown", function (zEvent) {
    if (
        zEvent.shiftKey &&
        zEvent.altKey &&
        (zEvent.key === "F" || zEvent.key === "f")
    ) {
        zEvent.preventDefault();
        load(textArea, textArea);
        flag(true);
    } else {
        if (zEvent.shiftKey && (zEvent.key === "s" || zEvent.key === "S")) {
            zEvent.preventDefault();
            SendQuery_click();
        }
    }
});
