import * as tweak from './tweak/dist/index.js'

import { PlotContext } from './plot/plot.js'

export async function mountDoodle(name, canvas, configContainer, initialState) {
	const doodle = await loadDoodle(name)
	const state = mount(doodle.default ?? doodle, canvas, configContainer, initialState)
	return `/doodle/?doodle=${name}#config=${encodeURIComponent(JSON.stringify(state))}`
}

async function loadDoodle(name) {
	const defaultScript = 'tree'
	try {
		return await import(`./doodles/${name || defaultScript}.js`)
	} catch (err) {
		return await import(`./doodles/${defaultScript}.js`)
	}
}

function mount(doodle, canvas, configContainer, initialState) {
	const ctx = canvas.getContext('2d')	
	let config

	let setup
	let setupGen

	const doodleParams = () => ({ config, canvas, ctx })
	
	const loop = () => {
		if (setup) {
			setupGen = setup(doodleParams())
			setup = undefined
		} else if (setupGen) {
			if (setupGen.next().done) setupGen = undefined
		} else {
			if (doodle.draw) doodle.draw(doodleParams())
		}
		requestAnimationFrame(loop)
	}
	requestAnimationFrame(loop)

	const restartDoodle = (newConfig) => {
		config = newConfig
		setup = doodle.setup
	}

	const resizeCanvas = () => {
		canvas.width = canvas.offsetWidth * devicePixelRatio
		canvas.height = canvas.offsetHeight * devicePixelRatio

		if (config) restartDoodle(config)
	}
	requestAnimationFrame(resizeCanvas)
	window.addEventListener('resize', resizeCanvas)

	const plotDoodle = () => {
		const params = { config, canvas, ctx: new PlotContext() }
		const setupGen = doodle.setup(params)
		if (setupGen) {
			for (const _ of setupGen) { }
		}
		if (doodle.draw) doodle.draw(params)
		const scale = 200 / canvas.height
		const center = { x: canvas.width / 2, y: canvas.height / 2 }
		console.log(params.ctx.output({ scale, center }))
	}
	document.querySelector('#btn-plot')?.addEventListener('click', plotDoodle)

	if (configContainer) {
		const config = doodle.config()
		config.state = initialState || config.state
		tweak.render(tweak.field(config), configContainer, restartDoodle)
		return config.state
	} else {
		const { state, getValue } = doodle.config()
		restartDoodle(getValue(initialState || state))
		return initialState || state
	}
}

