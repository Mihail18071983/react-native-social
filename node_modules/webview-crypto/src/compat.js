"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtle = void 0;
function subtle() {
    return window.crypto.subtle || window.crypto.webkitSubtle;
}
exports.subtle = subtle;
//# sourceMappingURL=compat.js.map