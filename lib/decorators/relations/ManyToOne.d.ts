import { ObjectType } from 'typeorm';
import { RelationOptions } from './common';
/**
 * A many-to-one relation allows creating the type of relation where Entity1 can have a single instance of Entity2, but
 * Entity2 can have multiple instances of Entity1. Entity1 is the owner of the relationship, and stores the id of
 * Entity2 on its side of the relation.
 */
export declare function ManyToOne<T>(typeFunctionOrTarget: string | ((type?: any) => ObjectType<T>), options?: RelationOptions): PropertyDecorator;
/**
 * A many-to-one relation allows creating the type of relation where Entity1 can have a single instance of Entity2, but
 * Entity2 can have multiple instances of Entity1. Entity1 is the owner of the relationship, and stores the id of
 * Entity2 on its side of the relation.
 */
export declare function ManyToOne<T>(typeFunctionOrTarget: string | ((type?: any) => ObjectType<T>), inverseSide?: string | ((object: T) => any), options?: RelationOptions): PropertyDecorator;
//# sourceMappingURL=ManyToOne.d.ts.map