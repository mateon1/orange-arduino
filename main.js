document.addEventListener("DOMContentLoaded", function(){
    "use strict";
    var workerFooter = 'onmessage = function(ev) {\n    switch (ev.data.type) {\n        case "orange":\n            _cond = ev.data.state;\n            break;\n    }\n}\nvar _cond=0;\nvar LED = 15, ORANGE = 14, HIGH=1, LOW=0;\nfunction getPin(n) {return ev.data.state; }\nfunction setPin(n, v) {if (n == LED) postMessage({type:"led", state: v}); }\nfunction getCapacitor(n, l) {\n    return ~~ ( (Math.random()*.6+.7) * l * (n == ORANGE && _cond ? 1 : 0.04) );\n}\npostMessage({type: "alive"});\nsetup();\nsetInterval(loop, 30);';

    var ora = document.querySelector("#ora"),
        led = document.querySelector("#led"),
        execute=document.querySelector("input");
    function makeWorker(source) {
        var blob = new Blob([source], {type: "application/javascript"});
        var worker = new Worker(URL.createObjectURL(blob));
        return worker;
    }

    var curWorker = null;
    function swapWorker(src) {
        if (curWorker) curWorker.terminate();
        curWorker = makeWorker(src);
        curWorker.onmessage = wmsg;
    }
    function wmsg(ev) {
        switch (ev.data.type) {
            case "led":
                led.className = ev.data.state ? "led-on" : "led-off"
                break;
            case "alive":
                console.log("Worker is alive!");
                break;
            default:
                console.log("Unkown worker message", ev);
        }
    }

    ora.addEventListener("mouseover", function () {
        if (!curWorker) return false;
        curWorker.postMessage({type:"orange", state:1});
    });
    ora.addEventListener("mouseleave", function () {
        if (!curWorker) return false;
        curWorker.postMessage({type:"orange", state:0});
    });
    execute.addEventListener("click", function () {
        console.log("Executing code!");
        swapWorker(document.querySelector("textarea").value + workerFooter);
    });
    console.log("loaded!");
});
