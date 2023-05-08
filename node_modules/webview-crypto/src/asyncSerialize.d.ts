export interface Serializer<T, S> {
    id: string;
    isType: (o: any) => boolean;
    toObject?: (t: T) => Promise<S>;
    fromObject?: (o: S) => Promise<T>;
}
export declare function toObjects(serializers: Serializer<any, any>[], o: any): Promise<any>;
export declare function fromObjects(serializers: Serializer<any, any>[], o: any): Promise<any>;
