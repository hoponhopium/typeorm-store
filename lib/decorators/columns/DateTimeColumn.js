"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeColumn = void 0;
const Column_1 = require("./Column");
/**
 * DateTimeColumn decorator is used to mark a specific class property as a `timestamp with time zone` table column.
 * Column value is transformed to `Date` type.
 */
function DateTimeColumn(options) {
    return (0, Column_1.Column)('timestamp with time zone', options);
}
exports.DateTimeColumn = DateTimeColumn;
//# sourceMappingURL=DateTimeColumn.js.map