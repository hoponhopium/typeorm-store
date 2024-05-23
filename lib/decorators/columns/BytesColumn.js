"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BytesColumn = void 0;
const Column_1 = require("./Column");
/**
 * BytesColumn decorator is used to mark a specific class property as a `bytea` table column.
 * Column value is transformed to `Uint8Array` type.
 */
function BytesColumn(options) {
    return (0, Column_1.Column)('bytea', options);
}
exports.BytesColumn = BytesColumn;
//# sourceMappingURL=BytesColumn.js.map