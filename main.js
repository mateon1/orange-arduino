document.addEventListener("DOMContentLoaded", function(){
    "use strict";
    var LED = 15, ORANGE = 14;
    var workerFooter = `
var LED = 15, ORANGE = 14, HIGH=1, LOW=0, UNKNOWN=-1;
var _loopTime = 30; // in ms
var _pinStatus = {};
onmessage = function(ev) {
    switch (ev.data.type) {
        case "updatePin":
            _error("UpdatePin: " + JSON.stringify(ev.data));
            _setPin(ev.data.pinId, ev.data.state, true);
            break;
        case "init":
            _error("InitPin: " + JSON.stringify(ev.data));
            _initPins(ev.data.pins);
            break;
        default:
            _error("Unknown event, " + JSON.stringify(ev.data));
            break;
    }
}

function _error(msg) {
    if (self.console && console.log) console.log(msg);
    postMessage({type: "error", msg: msg});
}

function _initPins(o) {
    for (var pin in o) {
        if (o.hasOwnProperty(pin)) {
            var val = o[pin];
            if (_pinStatus[pin] !== val) _setPin(pin, val, true);
        }
    }
}

function _setPin(id, v, triggerEvents) {
    if (_pinStatus[id] == v) return;
    _pinStatus[id] = v;
    // TODO: Events
}

function getPin(n) {return _pinStatus[n] ? HIGH : LOW; } // Undefined -> Low
function setPin(n, v) {
    if (_pinStatus[n] == v) return;
    _setPin(n, v, false)
    postMessage({type:"pushPin", pinId: n, state: v});
}
function getCapacitor(n, l) {
    return l * (getPin(n) == HIGH);
    // return ~~ ( (Math.random()*.6+.7) * l * (n == ORANGE && _cond ? 1 : 0.04) );
}
postMessage({type: "alive"});
setup();
(function loopClosure() {
    loop();
    setTimeout(loopClosure, _loopTime); // Not setInterval() to allow more idle time
}());`;

    var ora = document.querySelector("#ora"),
        led = document.querySelector("#led"),
        execute=document.querySelector("input");
    function makeWorker(source) {
        var blob = new Blob([source], {type: "application/javascript"});
        var worker = new Worker(URL.createObjectURL(blob));
        return worker;
    }

    var curWorker = null, oraState = false;
    function swapWorker(src) {
        if (curWorker) curWorker.terminate();
        curWorker = makeWorker(src);
        curWorker.onmessage = wmsg;
        var p = {}
    p[ORANGE] = oraState;
    curWorker.postMessage({type: "init", pins: p})
    }
    function wmsg(ev) {
        switch (ev.data.type) {
            case "pushPin":
                if (ev.data.pinId == LED) led.className = ev.data.state ? "led-on" : "led-off"
                break;
            case "alive":
                console.log("Worker is alive!");
                var p = {}
                p[ORANGE] = oraState;
                curWorker.postMessage({type: "init", pins: p})
                break;
            default:
                console.log("Unkown worker message", ev);
        }
    }

    ora.addEventListener("mouseover", function () {
        oraState = true;
        if (!curWorker) return false;
        curWorker.postMessage({type:"updatePin", pinId: ORANGE, state:1});
    });
    ora.addEventListener("mouseleave", function () {
        oraState = false;
        if (!curWorker) return false;
        curWorker.postMessage({type:"updatePin", pinId: ORANGE, state:0});
    });
    execute.addEventListener("click", function () {
        led.className = "led-off";
        console.log("Executing code!");
        swapWorker(document.querySelector("textarea").value + workerFooter);
    });
    console.log("loaded!");
});
