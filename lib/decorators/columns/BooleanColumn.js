"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanColumn = void 0;
const Column_1 = require("./Column");
/**
 * BooleanColumn decorator is used to mark a specific class property as a `bool` table column.
 * Column value is transformed to `boolean` type.
 */
function BooleanColumn(options) {
    return (0, Column_1.Column)('bool', options);
}
exports.BooleanColumn = BooleanColumn;
//# sourceMappingURL=BooleanColumn.js.map