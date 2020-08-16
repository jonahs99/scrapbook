import { render as renderTemplate } from '../node_modules/lit-html/lit-html.js';
export const render = ({ state, template, getValue }, el, onChange) => {
    const renderState = (state) => {
        renderTemplate(template(state, renderState), el);
        if (onChange)
            onChange(getValue(state));
    };
    renderState(state);
};
/** Creates a doodle with setup() and draw() types inferred from the config */
export function doodle(config, doodle) {
    return { ...doodle, config };
}
