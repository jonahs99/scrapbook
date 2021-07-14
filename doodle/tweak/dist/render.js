import { render as renderTemplate } from '../node_modules/lit-html/lit-html.js';
export const render = ({ state, template, getValue }, el, onChange) => {
    const renderState = (newState) => {
        renderTemplate(template(newState, renderState), el);
        if (onChange)
            onChange(getValue(newState));
    };
    renderState(state);
};
/** Creates a doodle with setup() and draw() types inferred from the config */
export function doodle(config, doodle) {
    return { ...doodle, config };
}
