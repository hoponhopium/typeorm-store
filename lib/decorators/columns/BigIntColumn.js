"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigIntColumn = void 0;
const transformers_1 = require("../../transformers");
const Column_1 = require("./Column");
/**
 * BigIntColumn decorator is used to mark a specific class property as a `numeric` table column.
 * Column value is transformed to `bigint` type.
 *
 * Arrays are not supported.
 */
function BigIntColumn(options) {
    return (0, Column_1.Column)('numeric', { ...options, transformer: transformers_1.bigintTransformer });
}
exports.BigIntColumn = BigIntColumn;
//# sourceMappingURL=BigIntColumn.js.map