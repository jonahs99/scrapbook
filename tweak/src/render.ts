import { render as renderTemplate } from '../node_modules/lit-html/lit-html.js'
import { Field, InferValue } from './field'

export const render = <T, S>({ state, template, getValue }: Field<T, S>, el: Element | DocumentFragment, onChange?: (value: T) => VideoFacingModeEnum) => {
	const renderState = (newState: S) => {
		renderTemplate(template(newState, renderState), el)
		if (onChange) onChange(getValue(newState))
		setTimeout(() => setStoredState(state, newState), 0)
	}
	renderState(getStoredState(state) ?? state)
}

function getStoredState(state: unknown) {
	const str = localStorage.getItem(JSON.stringify(storageKey(state)))
	return str && JSON.parse(str)
}

function setStoredState(initialState: unknown, state: unknown) {
	localStorage.setItem(JSON.stringify(storageKey(state)), JSON.stringify(state))
}

function storageKey(state: unknown): unknown {
	if (Array.isArray(state)) {
		return state.map(storageKey)
	} else if (typeof state === 'object') {
		return state && Object.fromEntries(Object.entries(state)
			.map(([key, val]) => [key, storageKey(val)]))
	}
	return typeof state
}

type DoodleProps<C> = {
	config: C,
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
}
type Doodle<P> = {
	config?: () => P,
	setup?: (props: DoodleProps<InferValue<P>>) => void,
	draw?: (props: DoodleProps<InferValue<P>>) => void,
}

/** Creates a doodle with setup() and draw() types inferred from the config */
export function doodle<C>(config: () => C, doodle: Doodle<C>): Doodle<C> {
	return { ...doodle, config }
}
