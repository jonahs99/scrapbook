import { Field, InferValue } from './field';
export declare const render: <T, S>({ state, template, getValue }: Field<T, S>, el: Element | DocumentFragment, onChange?: ((value: T) => VideoFacingModeEnum) | undefined) => void;
declare type DoodleProps<C> = {
    config: C;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
};
declare type Doodle<P> = {
    config?: () => P;
    setup?: (props: DoodleProps<InferValue<P>>) => void;
    draw?: (props: DoodleProps<InferValue<P>>) => void;
};
/** Creates a doodle with setup() and draw() types inferred from the config */
export declare function doodle<C>(config: () => C, doodle: Doodle<C>): Doodle<C>;
export {};
