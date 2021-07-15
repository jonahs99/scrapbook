import { tweak, sample, Prando } from '../lib.js'

export function config() {
	return tweak.label('TREE:', {
		randomSeed: tweak.randomSeed(),
		iterations: tweak.integer(16),
		width: 8,
		decay: 0.85,
		branchPrb: 0.5,
		length: tweak.distribution({ normal: { mean: 60, stddev: 15 } }),
		angle: tweak.distribution({ normal: { mean: 0, stddev: 0.8 } }),
	})
}

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.translate(canvas.width / 2, canvas.height * 0.9)
	ctx.rotate(-Math.PI / 2)

	ctx.lineWidth = config.width;

	const rng = new Prando(config.randomSeed)
	tree({ config, ctx, rng })
}

function tree({ config, ctx, rng }, n = config.iterations) {
	if (n <= 0) return

	const l = sample(config.length, rng)
	const t = sample(config.angle, rng)
	const midpt = { x: l, y: 0 }
	const endpt = { x: midpt.x + l * Math.cos(t), y: l * Math.sin(t) }

	ctx.save()

	ctx.beginPath()
	ctx.moveTo(0, 0)
	ctx.quadraticCurveTo(midpt.x, midpt.y, endpt.x, endpt.y)
	ctx.stroke()

	ctx.translate(endpt.x, endpt.y)
	ctx.rotate(t)
	ctx.scale(config.decay, config.decay)

	tree({ config, ctx, rng }, n - 1)
	if (rng.next() < config.branchPrb) tree({ config, ctx, rng }, n - 1)

	ctx.restore()
}

