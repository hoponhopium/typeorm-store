"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringColumn = void 0;
const Column_1 = require("./Column");
/**
 * StringColumn decorator is used to mark a specific class property as a `text` table column.
 * Column value is transformed to `string` type.
 */
function StringColumn(options) {
    return (0, Column_1.Column)('text', options);
}
exports.StringColumn = StringColumn;
//# sourceMappingURL=StringColumn.js.map