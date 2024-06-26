"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = exports.Order = exports.Item = void 0;
const typeorm_1 = require("typeorm");
let Item = class Item {
    constructor(id, name) {
        if (id != null) {
            this.id = id;
            this.name = name;
        }
    }
};
exports.Item = Item;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Item.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Item.prototype, "name", void 0);
exports.Item = Item = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [String, String])
], Item);
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Item, { nullable: true }),
    __metadata("design:type", Item)
], Order.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Order.prototype, "qty", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)()
], Order);
let Data = class Data {
    constructor(props) {
        Object.assign(this, props);
    }
};
exports.Data = Data;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Data.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", Object)
], Data.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    __metadata("design:type", Object)
], Data.prototype, "textArray", void 0);
__decorate([
    (0, typeorm_1.Column)('int4'),
    __metadata("design:type", Object)
], Data.prototype, "integer", void 0);
__decorate([
    (0, typeorm_1.Column)('int4', { array: true }),
    __metadata("design:type", Object)
], Data.prototype, "integerArray", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { transformer: { from: (s) => s == null ? null : BigInt(s), to: (val) => val?.toString() } }),
    __metadata("design:type", Object)
], Data.prototype, "bigInteger", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Object)
], Data.prototype, "dateTime", void 0);
__decorate([
    (0, typeorm_1.Column)('bytea'),
    __metadata("design:type", Object)
], Data.prototype, "bytes", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], Data.prototype, "json", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Item),
    __metadata("design:type", Object)
], Data.prototype, "item", void 0);
exports.Data = Data = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [Object])
], Data);
//# sourceMappingURL=model.js.map