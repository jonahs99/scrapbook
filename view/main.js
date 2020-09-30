import f from 'flyd'
import lift from 'flyd/module/lift'
import fobj from 'flyd/module/obj'

v`<div>hi</div>`

// MOCK

const time = () => {
	const time$ = f.stream()
	f.on(() => requestAnimationFrame(time$), time$)
	requestAnimationFrame(time$)
	return time$
}

const doodle = {
	input: () => object({
		a: number(10),
		b: slider(30),
		color: string('#222'),
		moving: boolean(true),
		hidden: f.stream(30),
		time: time(),
	}),

	program: (input) => v`
		<svg width="400" height="400">
			<rect fill=${input.color} x="0" y="0" width=${l`100 + Math.sin(${input.time} / 1000) * 100`} height=${input.b} />
		</svg>
		<hr>
		${input.moving}`
}


// TEMPLATES

function v(strings, ...exprs) {
	const flatten = expr =>
		f.isStream(expr) ? expr :
			Array.isArray(expr) ? lift((...exprs) => [...exprs], ...expr.map(flatten)) :
				f.stream(expr)
	return lift(
		(...exprs) => html(strings, ...exprs),
		...exprs.map(flatten))
}

function l(strings, ...exprs) {
	const argnames = exprs.map((_, i) => `$${i}`)

	let fnbody = ''
	for (let i = 0; i < strings.length; i++) {
		fnbody += strings[i]
		if (exprs[i]) fnbody += argnames[i]
	}
	if (!fnbody.includes('return')) fnbody = `return ${fnbody}`

	const fn = new Function(...argnames, fnbody)

	return lift(fn, ...exprs.map(expr => f.isStream(expr) ? expr : f.stream(expr)))
}

const a = f.stream(1)
const b = f.stream(2)
const c = l`${a} + ${b} * ${b} + Math.sin(5)`
f.on(console.log, c)
a(2)
b(3)

// MAIN

import { render, html } from 'lit-html'

const canvas = document.querySelector('canvas')
const configContainer = document.querySelector('.config-container')

const renderView = f.on(template => render(template, configContainer))

const file = '../doodles/collide.js'
Promise.resolve(doodle).then(module => {
	const { input, program } = module

	const streams = input()
	const { view$ } = streams

	renderView(v`
		${view$()}
		<hr>
		${program(streams)}
	`)
})













function makeState(initial) {
	const update$ = f.stream()
	const state$ = f.scan((state, fn) => fn(state), initial, update$)
	return [state$, update$]
}

const inputView = f.curryN(3, (type, getValue, state$) => v`
	<span class="field__input">
		<input
			type=${type}
			.value=${state$}
			.checked=${type === 'checkbox' && state$}
			@input=${e => state$(getValue(e))}
		/>
	</span>
`)

const input = f.curryN(3, (type, getValue, initial) => {
	const state$ = f.stream(initial)
	state$.view$ = () => inputView(type, getValue, state$)
	return state$
})

const slider = (initial) => {
	const state$ = f.stream(initial)
	state$.view$ = () => v`
		<div>
		${inputView('range', e => Number(e.target.value), state$)}
		${inputView('number', e => Number(e.target.value), state$)}
		</div>
	`
	return state$
}

const string = input('text', e => e.target.value)
const number = input('number', e => Number(e.target.value))
// const slider = input('range', e => Number(e.target.value))
const boolean = input('checkbox', e => e.target.checked)

function object(streamObj) {
	const keys = Object.keys(streamObj)
	const streams = Object.values(streamObj)
	return {
		...streamObj,
		view$: () => v`
			<div class="field field__object">
				${streams.map((stream, i) => stream.view$ && v`
					<div class="field field__label">
						<span>${`${keys[i]}:`}</span>${stream.view$()}
					</div>`
				)}
			</div>`,
	}
}

function mapEntries(fn, obj) {
	return Object.fromEntries(Object.entries(obj)
		.map(([key, val]) => [key, fn(val)]))
}

const field = object({
	a: number(5),
	b: object({
		hello: string('world'),
		c: number(6),
		d: slider(7),
		yes: boolean(true),
	}),
})

function cat(...t$s) {
	return lift((...ts) => html`${ts}`, ...t$s)
}

