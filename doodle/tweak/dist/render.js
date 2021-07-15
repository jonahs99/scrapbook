import { render as renderTemplate, html } from '../node_modules/lit-html/lit-html.js';
export const render = ({ state, template, getValue }, el, onChange) => {
    const renderState = (newState) => {
        const stateHash = encodeURIComponent(JSON.stringify(newState));
        const field = html `
			${template(newState, renderState)}
			<a class="doodle-link" href=${`#config=${stateHash}`}>link</a>
		`;
        renderTemplate(field, el);
        if (onChange)
            onChange(getValue(newState));
    };
    renderState(state);
};
/** Creates a doodle with setup() and draw() types inferred from the config */
export function doodle(config, doodle) {
    return { ...doodle, config };
}
