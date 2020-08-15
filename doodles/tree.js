import { tweak, sample, Prando } from '../lib.js'

export function config() {
	return tweak.label('TREE:', {
		animate: tweak.union({
			off: undefined,
			lerp: tweak.number(0.01, 0.01, 0.01, 1),
		}),
		iterations: tweak.integer(26),
		width: 6,
		decay: 0.89,
		branchPrb: 0.24,
		length: tweak.distribution({ normal: { mean: 40, stddev: 10 } }),
		angle: tweak.distribution({ normal: { mean: 0, stddev: 0.5 } }),
		randomSeed: tweak.integer(154),
	})
}

const anim = 0.02
let configAnim

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'
}

export function draw({ config, ctx, canvas }) {
	if (config.animate.lerp) {
		configAnim = lerp(configAnim, config, config.animate.lerp)
		config = configAnim
	} else {
		configAnim = config	
	}

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

const lerp = (a, b, delta) => {
	if (typeof a !== typeof b) return b

	if (typeof b === 'number') {
		if (isNaN(b)) return a
		if (Math.abs(a - b) < (Math.abs(b) / 10000)) return b
		return a * (1 - delta) + b * delta
	}

	if (Array.isArray(b)) {
		if (a.length === b.length) return b.map((val, i) => lerp(a[i], val, delta))
	}

	if (typeof b === 'object') {
		return Object.fromEntries(Object.entries(b).map(([key, val]) => [key, lerp(a[key], val, delta)]))
	}

	return b
}

