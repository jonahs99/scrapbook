import f from 'flyd'
import { html } from 'lit-html'

import lift from 'flyd/module/lift'
import every from 'flyd/module/every'

export function field(pattern) {
    if (f.isStream(pattern)) return pattern

    if (typeof pattern === 'number') return number(pattern)
    if (typeof pattern === 'string') return string(pattern)
    if (typeof pattern === 'boolean') return boolean(pattern)
    if (typeof pattern === 'object') return object(mapEntries(field, pattern))

    console.error(`No field found for ${pattern}`)
}

export const slider = (initial) => {
    const state$ = f.stream(initial)
    state$.view$ = () => htmlStream`
        <div>
            ${inputView('range', e => Number(e.target.value), state$)}
            ${inputView('number', e => Number(e.target.value), state$)}
        </div>
    `
    return state$
}

export const time = () => {
	const time$ = f.stream()
	f.on(() => requestAnimationFrame(time$), time$)
    requestAnimationFrame(time$)
	return time$
}

export const mic = (opts) => {
    let analyser
    let data
    navigator.mediaDevices.getUserMedia({ audio: true }).then(media => {
        const context = new AudioContext()
        const source = context.createMediaStreamSource(media)

        analyser = context.createAnalyser()
        if (opts) {
            Object.assign(analyser, opts)
        }
        source.connect(analyser)

        const dataLen = analyser.frequencyBinCount
        data = new Float32Array(dataLen)
    })

    const time$ = time()
    const mic$ = f.stream()
    f.on(_ => {
        if (analyser) {
            analyser.getFloatFrequencyData(data)
            mic$(data)
        }
    }, time$)
    return mic$
}

// VIEWS

function htmlStream(strings, ...exprs) {
	const flatten = expr =>
		f.isStream(expr) ? expr :
			Array.isArray(expr) ? lift((...exprs) => [...exprs], ...expr.map(flatten)) :
			f.stream(expr)
	return lift(
		(...exprs) => html(strings, ...exprs),
		...exprs.map(flatten))
}

const inputView = f.curryN(3, (type, getValue, state$) => htmlStream`
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

const string = input('text', e => e.target.value)
const number = input('number', e => Number(e.target.value))
const boolean = input('checkbox', e => e.target.checked)

function object(streamObj) {
    const keys = Object.keys(streamObj)
    const streams = Object.values(streamObj)
    return {
        ...streamObj,
        view$: () => htmlStream`
        <div class="field field__object">
            ${streams.map((stream, i) => stream.view$ && htmlStream`
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
