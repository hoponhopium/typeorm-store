export declare class Item {
    id: string;
    name?: string;
    constructor(id?: string, name?: string);
}
export declare class Order {
    id: string;
    item: Item;
    qty: number;
}
export declare class Data {
    constructor(props?: Partial<Data>);
    id: string;
    text?: string | null;
    textArray?: string[] | null;
    integer?: number | null;
    integerArray?: number[] | null;
    bigInteger?: bigint | null;
    dateTime?: Date | null;
    bytes?: Uint8Array | null;
    json?: unknown | null;
    item?: Item | null;
}
//# sourceMappingURL=model.d.ts.map