"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromObjects = exports.toObjects = void 0;
var lodash_1 = require("lodash");
function isSerialized(object) {
    return object.hasOwnProperty("__serializer_id");
}
function toObjects(serializers, o) {
    return __awaiter(this, void 0, void 0, function () {
        var serializer, value, _a, newO, _b, _c, _i, atr, _d, _e;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (typeof o !== "object") {
                        return [2 /*return*/, o];
                    }
                    serializer = (0, lodash_1.find)(serializers, function (s) { return s.isType(o); });
                    if (!serializer) return [3 /*break*/, 5];
                    if (!serializer.toObject) return [3 /*break*/, 2];
                    return [4 /*yield*/, serializer.toObject(o)];
                case 1:
                    _a = _g.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = o;
                    _g.label = 3;
                case 3:
                    value = _a;
                    _f = {
                        __serializer_id: serializer.id
                    };
                    return [4 /*yield*/, toObjects(serializers, value)];
                case 4: return [2 /*return*/, (_f.value = _g.sent(),
                        _f)];
                case 5:
                    newO = o instanceof Array ? [] : {};
                    _b = [];
                    for (_c in o)
                        _b.push(_c);
                    _i = 0;
                    _g.label = 6;
                case 6:
                    if (!(_i < _b.length)) return [3 /*break*/, 9];
                    atr = _b[_i];
                    _d = newO;
                    _e = atr;
                    return [4 /*yield*/, toObjects(serializers, o[atr])];
                case 7:
                    _d[_e] = _g.sent();
                    _g.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: return [2 /*return*/, newO];
            }
        });
    });
}
exports.toObjects = toObjects;
function fromObjects(serializers, o) {
    return __awaiter(this, void 0, void 0, function () {
        var value, serializer, newO, _a, _b, _i, atr, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (typeof o !== "object") {
                        return [2 /*return*/, o];
                    }
                    if (!isSerialized(o)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fromObjects(serializers, o.value)];
                case 1:
                    value = _e.sent();
                    serializer = (0, lodash_1.find)(serializers, ["id", o.__serializer_id]);
                    if (serializer.fromObject) {
                        return [2 /*return*/, serializer.fromObject(value)];
                    }
                    return [2 /*return*/, value];
                case 2:
                    newO = o instanceof Array ? [] : {};
                    _a = [];
                    for (_b in o)
                        _a.push(_b);
                    _i = 0;
                    _e.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    atr = _a[_i];
                    _c = newO;
                    _d = atr;
                    return [4 /*yield*/, fromObjects(serializers, o[atr])];
                case 4:
                    _c[_d] = _e.sent();
                    _e.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, newO];
            }
        });
    });
}
exports.fromObjects = fromObjects;
//# sourceMappingURL=asyncSerialize.js.map