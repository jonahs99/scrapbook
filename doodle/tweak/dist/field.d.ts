import { TemplateResult } from '../node_modules/lit-html/lit-html.js';
export declare type Field<T, S = unknown> = {
    state: S;
    template: Template<T, S>;
    getValue: (state: S) => T;
};
declare type Template<T, S> = (state: S, set: (newState: S) => void) => TemplateResult;
declare type Infer<P> = Field<InferValue<P>, InferState<P>>;
export declare type InferValue<P> = [
    P
] extends [Field<infer T, infer _S>] ? T : [
    P
] extends [undefined] ? undefined : [
    P
] extends [boolean] ? boolean : [
    P
] extends [number] ? number : [
    P
] extends [string] ? string : P extends (infer U)[] ? InferValue<U>[] : P extends {
    [key: string]: any;
} ? {
    [K in keyof P]: InferValue<P[K]>;
} : never;
declare type InferState<P> = [
    P
] extends [Field<infer _T, infer S>] ? S : [
    P
] extends [undefined] ? undefined : [
    P
] extends [boolean] ? boolean : [
    P
] extends [number] ? number : [
    P
] extends [string] ? string : P extends (infer U)[] ? InferState<U>[] : P extends {
    [key: string]: any;
} ? {
    [K in keyof P]: InferState<P[K]>;
} : never;
/** Dynamically creates a field from the shape of the pattern. Compose fields with objects and homogenous lists */
export declare function field<P>(pattern: P): Infer<P>;
export declare function map<P, T>(pattern: P, fn: (value: InferValue<P>) => T): Field<T, InferState<P>>;
export declare function copyable<P>(pattern: P): Infer<P>;
/** Labelled field */
export declare function label<P>(text: string, pattern: P): Infer<P>;
export declare function describe<P>(content: string, pattern: P): Infer<P>;
/** Can be disabled */
export declare function maybe<P>(pattern: P, on?: boolean): Field<undefined | InferValue<P>, {
    on: boolean;
    state: InferState<P>;
}>;
/** Select between fixed options */
export declare function select<T>(...options: T[]): Field<T, T>;
/** Select between fields of different types */
export declare function union<P extends {
    [key: string]: any;
}>(pattern: P): Field<ValueOf<{ [P_1 in keyof P]: Pick<P, P_1>; }>, {
    key: keyof P;
    state: { [K in keyof P]: any; };
}>;
export declare const number: (value: number, step?: R[0] | undefined, min?: number | undefined, max?: number | undefined, units?: string | undefined) => Field<number, number>;
export declare const slider: (value: number, step?: R[0] | undefined, min?: number | undefined, max?: number | undefined, units?: string | undefined) => Field<number, number>;
export declare function integer(value: number, min?: number, max?: number, units?: string): Field<number, number>;
export declare function degrees(value: number, step?: number, min?: number, max?: number): Field<number, number>;
export declare function randomSeed(value?: number): Field<number, number>;
export declare function distribution(value?: ContinuousDistribution): Field<ValueOf<{
    uniform: Pick<{
        uniform: {
            min: number;
            max: number;
        };
        normal: {
            mean: number;
            stddev: number;
        };
    }, "uniform">;
    normal: Pick<{
        uniform: {
            min: number;
            max: number;
        };
        normal: {
            mean: number;
            stddev: number;
        };
    }, "normal">;
}>, {
    key: "normal" | "uniform";
    state: {
        uniform: any;
        normal: any;
    };
}>;
declare type ContinuousDistribution = Variant<{
    uniform: {
        min: number;
        max: number;
    };
    normal: {
        mean: number;
        stddev: number;
    };
}>;
declare type ValueOf<T> = T[keyof T];
declare type Variant<T> = ValueOf<{
    [P in keyof T]: Pick<T, P>;
}>;
export {};
