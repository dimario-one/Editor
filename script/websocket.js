// let WS_URL = "wss://cntdev.ru/wss-www/";
const WS_URL = "ws://127.0.0.1:2020/";
let openedSocket = null;

// Инициализация веб-сокета и всего, что с ним связано
let page_start = function (on_connect) {
    
    // Создание экземпляра ws
    let wsImpl = window.WebSocket || window.MozWebSocket;
    window.ws = new wsImpl(WS_URL);

    // Переопределение обработчиков
    ws.onopen = function () {
        try {
            sessionStorage.setItem('SID', CreateGUID());
            ws.send("[" + getSID()+ "]");
            debug("Сокет открыт.");
            on_connect();
        } catch (e) {
            debug(e);
        }
    };

    ws.onclose = function () {
        debug("Сокет закрыт. Восстанавливаем");
        setTimeout(page_start, 5000);
    };

    ws.onmessage = function (evt) {
        let message = evt.data;
        ParseMessage(message);
    };
};
