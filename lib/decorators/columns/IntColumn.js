"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntColumn = void 0;
const Column_1 = require("./Column");
/**
 * IntColumn decorator is used to mark a specific class property as a `int4` table column.
 * Column value is transformed to `number` type.
 */
function IntColumn(options) {
    return (0, Column_1.Column)('int4', options);
}
exports.IntColumn = IntColumn;
//# sourceMappingURL=IntColumn.js.map