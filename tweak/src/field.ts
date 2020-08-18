import { TemplateResult, html } from '../node_modules/lit-html/lit-html.js'

export type Field<T, S=unknown> = { state: S, template: Template<T, S>, getValue: (state: S) => T }
type Template<T, S> = (state: S, set: (newState: S) => void) => TemplateResult

type Infer<P> = Field<InferValue<P>, InferState<P>>
export type InferValue<P> =
	[P] extends [Field<infer T, infer _S>] ? T :
	[P] extends [undefined] ? undefined :
	[P] extends [boolean] ? boolean :
	[P] extends [number] ? number :
	[P] extends [string] ? string :
	P extends (infer U)[] ? InferValue<U>[] :
	P extends { [key: string]: any } ? { [K in keyof P]: InferValue<P[K]> } :
	never
type InferState<P> =
	[P] extends [Field<infer _T, infer S>] ? S :
	[P] extends [undefined] ? undefined :
	[P] extends [boolean] ? boolean :
	[P] extends [number] ? number :
	[P] extends [string] ? string :
	P extends (infer U)[] ? InferState<U>[] :
	P extends { [key: string]: any } ? { [K in keyof P]: InferState<P[K]> } :
	never

/** Dynamically creates a field from the shape of the pattern. Compose fields with objects and homogenous lists */
export function field<P>(pattern: P): Infer<P>
export function field<P>(pattern: P) {
	if (isField(pattern)) return pattern
	if (typeof pattern === 'undefined') return none()
	if (typeof pattern === 'boolean') return boolean(pattern)
	if (typeof pattern === 'number') return number(pattern)
	if (typeof pattern === 'string') return string(pattern)
	if (Array.isArray(pattern)) return list(pattern.map((item) => field(item).state), field(pattern[0]))
	if (typeof pattern === 'object') return object(mapObject(mapObject(pattern, field), (field, key) => label(`${key}:`, field)))
	console.error(`Could not infer field for pattern ${pattern}`)
}

export function copyable<P>(pattern: P): Infer<P> {
	return mapTemplate<any, any>(field(pattern), (inner, state, set) => html`
		${inner}
		<button
			@click=${() => navigator.clipboard.writeText(state && JSON.stringify(state, undefined, '\t'))}
		>COPY</button>
		<button
			@click=${() => {
				const json = prompt('Enter a JSON state string')
				if (json) set(JSON.parse(json))
			}}
		>PASTE</button>
	`)
}

/** Labelled field */
export function label<P>(text: string, pattern: P): Infer<P> {
	return mapTemplate<any, any>(field(pattern), (inner) => labeled(text, inner)) as any
}

export function describe<P>(content: string, pattern: P): Infer<P> {
	return mapTemplate<any, any>(field(pattern), (inner) => described(content, inner)) as any
}

/** Can be disabled */
export function maybe<P>(pattern: P, on=false):
	Field<undefined | InferValue<P>, { on: boolean, state: InferState<P> }> {
	const enable = field(on);
	const inner = field(pattern);
	return {
		state: {
			on: enable.state,
			state: inner.state
		},
		template: (state, set) => html`
			${enable.template(state.on, (on) => set({ ...state, on }))}
			<span class=${!state.on ? 'field__maybe-disabled' : ''}>
				${inner.template(state.state, (newState) => set({ ...state, state: newState }))}
			</span>
		`,
		getValue: ({ on, state }) => on ? inner.getValue(state) : undefined,
	}
}

/** Select between fixed options */
export function select<T>(...options: T[]): Field<T, T> {
	return {
		state: options[0],
		template: (state, set) => html`
			<span class="field field__select">
				<select .value=${state} @change=${(evt: any) => set(evt.target.value)}>
					${options.map((option) => html`
						<option>${option}</option>
					`)}
				</select>
			</span>
		`,
		getValue: identity,
	}
}

/** Select between fields of different types */
export function union<P extends { [key: string]: any }>(pattern: P) {
	return taggedUnion(mapObject(pattern, field))
}

export const number = valueField((value: number, step=Math.abs((value||1)/100).toPrecision(1), min?: number, max?: number, units?: string) => (value, setValue) => html`
	<span class="field field__boolean">
		<input type="number" step=${step} min=${min} max=${max}
			.value=${value}
			@change=${(evt: any) => {
				const num = parseFloat(evt.target.value)
				if (!isNaN(num)) setValue(num)
			}}
		>
		${units && html`<span>${units}</span>`}
	</span>
`)

export function integer(value: number, min?: number, max?: number, units?: string) {
	return number(value, 1, min, max, units)
}

export function degrees(value: number, step?: number, min?: number, max?: number) {
	return number(value, step, min, max, '°')
}

export function randomSeed(value?: number) {
	const rand = () => Math.floor(Math.random() * 2147483647)
	return mapTemplate(integer(value ?? rand()), (inner, _state, set) => html`
		${inner}
		<button
			@click=${() => set(rand())}
		>&#9858;</button>
	`)
}

export function distribution(value?: ContinuousDistribution) {
	return union(assignFirst({
		uniform: { min: 0, max: 1 },
		normal: { mean: 0, stddev: 1 },
	}, value ?? {}))
}

function taggedUnion<T, S extends { [K in keyof T]: any }>
	(fieldMap: { [K in keyof T]: Field<T[K], S[K]> }): Field<Variant<T>, { key: keyof T, state: S }> {
	const selectField = select(...Object.keys(fieldMap) as (keyof T)[]);
	return {
		state: { key: selectField.state, state: mapObject(fieldMap, (field) => field.state) },
		template: (state, set) => html`
			${selectField.template(
				state.key,
				(key) => set({...state, key})
			)}
			${fieldMap[state.key].template(
				state.state[state.key],
				(newState) => set({ ...state, state: { ...state.state, [state.key]: newState } })
			)}
		`,
		getValue: (state) => ({ [state.key]: fieldMap[state.key].getValue(state.state[state.key]) }) as any
	};
};

type ContinuousDistribution = Variant<{
	uniform: { min: number, max: number },
	normal: { mean: number, stddev: number },
}>

type ValueOf<T> = T[keyof T]
type Variant<T> = ValueOf<{ [P in keyof T]: Pick<T, P> }>

function mapTemplate<T, S>(field: Field<T, S>, fn: (inner: TemplateResult, state: S, set: (newValue: S) => void) => TemplateResult): Field<T, S> {
	return {
		state: field.state,
		template: (state, set) => fn(field.template(state, set), state, set),
		getValue: field.getValue,
	}
}

// A field where the first parameter is the default value
function valueField<T, R extends any[] = []>(factory: (value: T, ...args: R) => Template<T, T>): (value: T, ...args: R) => Field<T, T> {
	return (value: T, ...args: R) => ({
		state: value,
		template: factory(value, ...args),
		getValue: identity,
	})
}

function labeled(text: string, inner: TemplateResult): TemplateResult {
	return html`
		<div class="field field__label">
			<span>${text}</span>${inner}
		</div>
	`
}

function described(content: string, inner: TemplateResult): TemplateResult {
	return html`
		<div class="field field__describe">
			<span .innerHTML=${content}></span>${inner}
		</div>
	`
}

const none = () => valueField<undefined>(() => () => html``)(undefined);

const boolean = valueField(() => (value: boolean, setValue) => html`
	<span class="field field__boolean">
		<input type="checkbox" 
			.checked=${value}
			@change=${(evt: any) => setValue(evt.target.checked)}
		>
	</span>
`)

const string = valueField(() => (value: string, setValue) => html`
	<span class="field field__boolean">
		<input type="text" 
			.value=${value}
			@change=${(evt: any) => setValue(evt.target.value)}
		>
	</span>
`)

// Compose heterogenous fields
function object<O, S extends { [K in keyof O]: any }>
	(fieldMap: { [K in keyof O]: Field<O[K], S[K]> }): Field<O, S> {
	return {
		state: mapObject(fieldMap, (field) => field.state),
		template: (state, set) => html`
			<div class="field field__object">${
				mapEntries(fieldMap, (key, field) => field.template(
					state[key],
					(newState) => set({...state, [key]: newState}),
				))
			}</div>
		`,
		getValue: (stateMap) =>
			mapObject(stateMap, (state, key) => fieldMap[key as keyof O].getValue(state as S[keyof O]))
	}
}

// Variable length list
function list<T, S>(states: S[], field: Field<T, S>): Field<T[], S[]> {
	return {
		state: states,
		template: (states, set) => {
			const replace = <A>(arr: A[], i: number, values: A[] = []) => {
				arr = arr.slice()
				arr.splice(i, 1, ...values)
				return arr;
			}
			return html`
				<div class="field field__list">${
					states.map((state, i) => labeled(`${i}:`, html`
						<button @click=${() => set(replace(states, i))}>
							-
						</button>
						${field.template(
							state,
							(newState) => set(replace(states, i, [newState]))
						)}
					`))}
					<button @click=${() => set(replace(states, states.length, [states.length ? states[states.length - 1] : field.state]))}>
						+
					</button>
				</div>
			`
		},
		getValue: (state) => state.map(field.getValue),
	}
}

function identity<T>(value: T): T {
	return value
}

function mapEntries<T, U>(object: T, fn: (key: keyof T, value: T[keyof T]) => U): U[] {
	return Object.entries(object).map(([key, value]) => fn(key as keyof T, value));
}

function mapObject<V, U extends { [K in keyof V]: any }>(object: V, fn: (value: V[keyof V], key: keyof V) => U[keyof V]): U {
 	return Object.fromEntries(Object.entries(object)
		.map(([key, val]) => [key, fn(val, key as keyof V)])) as U
}

function isField(pattern: any): pattern is Field<unknown, unknown> {
	return typeof pattern === 'object' && 'template' in pattern
}

function variantType<U>(variant: U): keyof U {
	return Object.keys(variant)[0] as keyof U;
}

function variantValue<U>(variant: U): U[keyof U] {
	return Object.values(variant)[0] as U[keyof U];
}

function assignFirst<T extends { [key: string]: any }>(target: T, source: Partial<T>): T {
	const targetTakeSource = { ...target }
	Object.keys(source).forEach((key) => delete targetTakeSource[key])
	return { ...source, ...targetTakeSource }
}
