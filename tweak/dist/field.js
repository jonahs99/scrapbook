import { html } from '../node_modules/lit-html/lit-html.js';
export function field(pattern) {
    if (isField(pattern))
        return pattern;
    if (typeof pattern === 'undefined')
        return none();
    if (typeof pattern === 'boolean')
        return boolean(pattern);
    if (typeof pattern === 'number')
        return number(pattern);
    if (typeof pattern === 'string')
        return string(pattern);
    if (Array.isArray(pattern))
        return list(pattern.map((item) => field(item).state), field(pattern[0]));
    if (typeof pattern === 'object')
        return object(mapObject(mapObject(pattern, field), (field, key) => label(`${key}:`, field)));
    console.error(`Could not infer field for pattern ${pattern}`);
}
/** Labelled field */
export function label(text, pattern) {
    return mapTemplate(field(pattern), (inner) => labeled(text, inner));
}
/** Can be disabled */
export function maybe(pattern, on = false) {
    const enable = field(on);
    const inner = field(pattern);
    return {
        state: {
            on: enable.state,
            state: inner.state
        },
        template: (state, set) => html `
			${enable.template(state.on, (on) => set({ ...state, on }))}
			<!-- <span class=${`field field__maybe ${!state.on ? 'field__maybe-disabled' : ''}`}> -->
			<span class=${!state.on ? 'field__maybe-disabled' : ''}>
				${inner.template(state.state, (newState) => set({ ...state, state: newState }))}
			</span>
		`,
        getValue: ({ on, state }) => on ? inner.getValue(state) : undefined,
    };
}
/** Select between fixed options */
export function select(...options) {
    return {
        state: options[0],
        template: (state, set) => html `
			<span class="field field__select">
				<select .value=${state} @change=${(evt) => set(evt.target.value)}>
					${options.map((option) => html `
						<option>${option}</option>
					`)}
				</select>
			</span>
		`,
        getValue: identity,
    };
}
/** Select between fields of different types */
export function union(pattern) {
    return taggedUnion(mapObject(pattern, field));
}
export const number = valueField((value, step = Math.abs(value || 1 / 100).toPrecision(1), min, max, units) => (value, setValue) => html `
	<span class="field field__boolean">
		<input type="number" step=${step} min=${min} max=${max}
			.value=${value}
			@change=${(evt) => {
    const num = parseFloat(evt.target.value);
    if (!isNaN(num))
        setValue(num);
}}
		>
		${units && html `<span>${units}</span>`}
	</span>
`);
export function integer(value, min, max, units) {
    return number(value, 1, min, max, units);
}
export function degrees(value, step, min, max) {
    return number(value, step, min, max, '°');
}
export function distribution(value) {
    return union(assignFirst({
        uniform: { min: 0, max: 1 },
        normal: { mean: 0, stddev: 1 },
    }, value ?? {}));
}
function taggedUnion(fieldMap) {
    const selectField = select(...Object.keys(fieldMap));
    return {
        state: { key: selectField.state, state: mapObject(fieldMap, (field) => field.state) },
        template: (state, set) => html `
			${selectField.template(state.key, (key) => set({ ...state, key }))}
			${fieldMap[state.key].template(state.state[state.key], (newState) => set({ ...state, state: { ...state.state, [state.key]: newState } }))}
		`,
        getValue: (state) => ({ [state.key]: fieldMap[state.key].getValue(state.state[state.key]) })
    };
}
;
function mapTemplate(field, fn) {
    return {
        state: field.state,
        template: (state, set) => fn(field.template(state, set), state, set),
        getValue: field.getValue,
    };
}
// A field where the first parameter is the default value
function valueField(factory) {
    return (value, ...args) => ({
        state: value,
        template: factory(value, ...args),
        getValue: identity,
    });
}
function labeled(text, inner) {
    return html `
		<div class="field field__label">
			<span>${text}</span>${inner}
		</div>
	`;
}
const none = () => valueField(() => () => html ``)(undefined);
const boolean = valueField(() => (value, setValue) => html `
	<span class="field field__boolean">
		<input type="checkbox" 
			.checked=${value}
			@change=${(evt) => setValue(evt.target.checked)}
		>
	</span>
`);
const string = valueField(() => (value, setValue) => html `
	<span class="field field__boolean">
		<input type="text" 
			.value=${value}
			@change=${(evt) => setValue(evt.target.value)}
		>
	</span>
`);
// Compose heterogenous fields
function object(fieldMap) {
    return {
        state: mapObject(fieldMap, (field) => field.state),
        template: (state, set) => html `
			<div class="field field__object">${mapEntries(fieldMap, (key, field) => field.template(state[key], (newState) => set({ ...state, [key]: newState })))}</div>
		`,
        getValue: (stateMap) => mapObject(stateMap, (state, key) => fieldMap[key].getValue(state))
    };
}
// Variable length list
function list(states, field) {
    return {
        state: states,
        template: (states, set) => {
            const replace = (arr, i, values = []) => {
                arr = arr.slice();
                arr.splice(i, 1, ...values);
                return arr;
            };
            return html `
				<div class="field field__list">${states.map((state, i) => labeled(`${i}:`, html `
						<button @click=${() => set(replace(states, i))}>
							-
						</button>
						${field.template(state, (newState) => set(replace(states, i, [newState])))}
					`))}
					<button @click=${() => set(replace(states, states.length, [states.length ? states[states.length - 1] : field.state]))}>
						+
					</button>
				</div>
			`;
        },
        getValue: (state) => state.map(field.getValue),
    };
}
function identity(value) {
    return value;
}
function mapEntries(object, fn) {
    return Object.entries(object).map(([key, value]) => fn(key, value));
}
function mapObject(object, fn) {
    return Object.fromEntries(Object.entries(object)
        .map(([key, val]) => [key, fn(val, key)]));
}
function isField(pattern) {
    return typeof pattern === 'object' && 'template' in pattern;
}
function variantType(variant) {
    return Object.keys(variant)[0];
}
function variantValue(variant) {
    return Object.values(variant)[0];
}
function assignFirst(target, source) {
    const targetTakeSource = { ...target };
    Object.keys(source).forEach((key) => delete targetTakeSource[key]);
    return { ...source, ...targetTakeSource };
}
