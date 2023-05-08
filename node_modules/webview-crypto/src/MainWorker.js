"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var serialize_error_1 = __importDefault(require("serialize-error"));
var serializeBinary_1 = require("./serializeBinary");
var SUBTLE_METHODS = [
    "encrypt",
    "decrypt",
    "sign",
    "verify",
    "digest",
    "generateKey",
    "deriveKey",
    "deriveBits",
    "importKey",
    "exportKey",
    "wrapKey",
    "unwrapKey"
];
/*
MainWorker provides a `crypto` attribute that proxies method calls
to the webview.

It sends strings to the webview in the format:

    {
      id: <id>,
      method: getRandomValues | subtle.<method name>,
      args: [<serialized arg>]
    }

When the webview succeeds in completeing that method, it gets backs:

    {
      id: <id>,
      value: <serialized return value>
    }

And when it fails:

    {
      id: <id>,
      reason: <serialized rejected reason>,
    }

*/
var MainWorker = /** @class */ (function () {
    // sendToWebView should take a string and send that message to the webview
    function MainWorker(sendToWebView, debug) {
        if (debug === void 0) { debug = false; }
        this.sendToWebView = sendToWebView;
        this.debug = debug;
        // hold a queue of messages to send, in case someone calls crypto
        // before the webview is initialized
        this.toSend = [];
        this.readyToSend = false;
        // Holds the `resolve` and `reject` function for all the promises
        // we are working on
        this.messages = {};
    }
    Object.defineProperty(MainWorker.prototype, "crypto", {
        get: function () {
            var callMethod = this.callMethod;
            return {
                subtle: this.subtle,
                getRandomValues: this.getRandomValues.bind(this),
                fake: true
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MainWorker.prototype, "subtle", {
        get: function () {
            var _this = this;
            var s = {};
            var _loop_1 = function (m) {
                s[m] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return _this.callMethod("subtle." + m, args, true);
                };
            };
            for (var _i = 0, SUBTLE_METHODS_1 = SUBTLE_METHODS; _i < SUBTLE_METHODS_1.length; _i++) {
                var m = SUBTLE_METHODS_1[_i];
                _loop_1(m);
            }
            return s;
        },
        enumerable: false,
        configurable: true
    });
    MainWorker.prototype.getRandomValues = function (array) {
        var promise = this.callMethod("getRandomValues", [array], false);
        // make the _promise not enumerable so it isn't JSON stringified,
        // which could lead to an infinite loop with Angular's zone promises
        Object.defineProperty(array, "_promise", {
            value: promise,
            configurable: true,
            enumerable: false,
            writable: true
        });
        promise.then(function (updatedArray) {
            array.set(updatedArray);
        });
        return array;
    };
    MainWorker.prototype.onWebViewMessage = function (message) {
        var _this = this;
        // first message just tells us the webview is ready
        if (!this.readyToSend) {
            if (this.debug) {
                console.log("[webview-crypto] Got first message; ready to send");
            }
            ;
            this.readyToSend = true;
            for (var _i = 0, _a = this.toSend; _i < _a.length; _i++) {
                var m = _a[_i];
                this.sendToWebView(m);
            }
            return;
        }
        (0, serializeBinary_1.parse)(message).then(function (_a) {
            var id = _a.id, value = _a.value, reason = _a.reason;
            if (_this.debug) {
                console.log("[webview-crypto] Received message:", JSON.stringify({
                    id: id,
                    value: value,
                    reason: reason
                }));
            }
            ;
            if (!id) {
                console.warn("[webview-crypto] no ID passed back from message:", JSON.stringify((0, serialize_error_1.default)(reason)));
                return;
            }
            var _b = _this.messages[id], resolve = _b.resolve, reject = _b.reject;
            if (!reason) {
                resolve(value);
            }
            else {
                reject(reason);
            }
            delete _this.messages[id];
        }).catch(function (reason) {
            console.warn("[webview-crypto] error in `parse` of message:", JSON.stringify(message), "reason:", JSON.stringify((0, serialize_error_1.default)(reason)));
        });
    };
    MainWorker.prototype.callMethod = function (method, args, waitForArrayBufferView) {
        var _this = this;
        var id = MainWorker.uuid();
        // store this promise, so we can resolve it when we get a message
        // back from the web view
        var promise = new Promise(function (resolve, reject) {
            _this.messages[id] = { resolve: resolve, reject: reject };
        });
        var payloadObject = { method: method, id: id, args: args };
        if (this.debug) {
            console.log("[webview-crypto] Sending message:", JSON.stringify({
                method: method,
                args: args,
                payloadObject: payloadObject
            }));
        }
        ;
        (0, serializeBinary_1.stringify)(payloadObject, waitForArrayBufferView)
            .then(function (message) {
            if (_this.readyToSend) {
                _this.sendToWebView(message);
            }
            else {
                _this.toSend.push(message);
            }
        })
            .catch(function (reason) {
            _this.messages[id].reject({
                message: "exception in stringify-ing message: " + method + " " + id,
                reason: reason
            });
            delete _this.messages[id];
        });
        return promise;
    };
    // http://stackoverflow.com/a/105074/907060
    MainWorker.uuid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4();
    };
    return MainWorker;
}());
exports.default = MainWorker;
//# sourceMappingURL=MainWorker.js.map