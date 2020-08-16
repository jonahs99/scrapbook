import * as tweak from './tweak/dist/index.js'

export function mountDoodle(doodle, canvas, configContainer) {
	const ctx = canvas.getContext('2d')	
	let config

	const runDoodle = (nextConfig) => {
		config = nextConfig

		const doodleParams = () => ({ config, canvas, ctx })

		// For now, call setup on every config change
		if (doodle.setup) {
			const setupGen = doodle.setup(doodleParams())
			if (setupGen) {
				const drive = () => {
					if (!setupGen.next().done) {
						requestAnimationFrame(drive)
					}
				}
				drive()
			}
		}

		if (doodle.draw) {
			const loop = () => {
				if (config !== nextConfig) return;
				doodle.draw(doodleParams())
				requestAnimationFrame(loop)
			}
			loop()
		}
	}

	const resizeCanvas = () => {
		canvas.width = canvas.parentElement.offsetWidth
		canvas.height = canvas.parentElement.offsetHeight

		if (config) runDoodle(config)
	}
	resizeCanvas()
	window.addEventListener('resize', resizeCanvas)

	tweak.render(tweak.field(doodle.config()), configContainer, runDoodle)
}

