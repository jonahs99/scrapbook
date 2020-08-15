import { tweak, Prando } from 'https://cdn.jsdelivr.net/gh/jonahs99/doodle/lib.js'

export function config() {
	return tweak.label('SPOT:', {
		x: 0,
		y: 0,
		scale: 100,
		randomSeed: tweak.integer(1),
	})
}

export function setup({ canvas, config, ctx }) {
	const rng = new Prando(config.randomSeed)

	canvas.style.background = '#000022'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.scale(config.scale, config.scale)

	ctx.fillStyle = '#fff'

	ctx.translate(config.x, config.y)

	const n = 12
	for (let i = 0; i < n; i++) {
		const t = 2 * Math.PI / n * i
		const r = rng.next(0.2, 0.4)
		const s = rng.next(0.8, 1)
		ctx.beginPath()
		ctx.arc(Math.cos(t) * r, Math.sin(t) * r, s, 0, 2 * Math.PI)
		ctx.fill()
	}
}

