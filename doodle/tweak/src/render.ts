import { render as renderTemplate, html } from '../node_modules/lit-html/lit-html.js'
import { Field, InferValue } from './field'

export const render = <T, S>({ state, template, getValue }: Field<T, S>, el: Element | DocumentFragment, onChange?: (value: T) => VideoFacingModeEnum) => {
	const renderState = (newState: S) => {
		const stateHash = encodeURIComponent(JSON.stringify(newState))
		const field = html`
			${template(newState, renderState)}
			<a class="doodle-link" href=${`#config=${stateHash}`}>link</a>
		`
		renderTemplate(field, el)
		if (onChange) onChange(getValue(newState))
	}
	renderState(state)
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
