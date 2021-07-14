import * as tweak from './tweak/dist/index.js'

import { PlotContext } from './plot/plot.js'

export function mountDoodle(doodle, canvas, configContainer) {
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
		canvas.width = canvas.parentElement.offsetWidth * devicePixelRatio
		canvas.height = canvas.parentElement.offsetHeight * devicePixelRatio

		if (config) restartDoodle(config)
	}
	resizeCanvas()
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
	document.querySelector('#btn-plot').addEventListener('click', plotDoodle)

	tweak.render(tweak.field(doodle.config()), configContainer, restartDoodle)
}

