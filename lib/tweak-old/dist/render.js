import { render as renderTemplate } from '../node_modules/lit-html/lit-html.js';
export const render = ({ state, template, getValue }, el, onChange) => {
    const renderState = (newState) => {
        renderTemplate(template(newState, renderState), el);
        if (onChange)
            onChange(getValue(newState));
        setTimeout(() => setStoredState(state, newState), 0);
    };
    renderState(getStoredState(state) ?? state);
};
function getStoredState(state) {
    const str = localStorage.getItem(JSON.stringify(storageKey(state)));
    return str && JSON.parse(str);
}
function setStoredState(initialState, state) {
    localStorage.setItem(JSON.stringify(storageKey(state)), JSON.stringify(state));
}
function storageKey(state) {
    if (Array.isArray(state)) {
        return state.map(storageKey);
    }
    else if (typeof state === 'object') {
        return state && Object.fromEntries(Object.entries(state)
            .map(([key, val]) => [key, storageKey(val)]));
    }
    return typeof state;
}
/** Creates a doodle with setup() and draw() types inferred from the config */
export function doodle(config, doodle) {
    return { ...doodle, config };
}
