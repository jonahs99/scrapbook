import { tweak, Prando } from 'https://cdn.jsdelivr.net/gh/jonahs99/doodle/lib.js'

export function config() {
	return tweak.label('TREE:', {
		iterations: tweak.integer(36),
		decay: 0.9,
		length: 80,
		angle: 5,
		branchPrb: 0.24,
		randomSeed: tweak.integer(116),
	})
}

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.translate(canvas.width / 2, canvas.height * 0.9)
	ctx.rotate(-Math.PI / 2)

	ctx.lineWidth = 6;

	const rng = new Prando(config.randomSeed)
	tree({ config, ctx, rng })
}

function tree({ config, ctx, rng }, n = config.iterations) {
	if (n <= 0) return

	const l = rng.next() * config.length
	const t = (rng.next() - 0.5) * config.angle
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
