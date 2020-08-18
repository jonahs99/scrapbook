import * as tweak from './tweak/dist/index.js'

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
		canvas.width = canvas.parentElement.offsetWidth
		canvas.height = canvas.parentElement.offsetHeight

		if (config) restartDoodle(config)
	}
	resizeCanvas()
	window.addEventListener('resize', resizeCanvas)

	tweak.render(tweak.field(doodle.config()), configContainer, restartDoodle)
}

