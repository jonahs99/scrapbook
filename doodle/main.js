import { inferField, colorField, normalField, sliderField, randIntField, attachForm } from './field.js'

const config = inferField({
	num: 1000,
	branchPrb: 0.3,
	scaling: normalField(0.8, 0.2),
	color: colorField('#000'),
	randomSeed: randIntField(0),
})

function sampleNormal({mean = 0, stddev = 1}) {
	const u0 = Math.random()
	const u1 = Math.random()
	const r = Math.sqrt(-2 * Math.log(u0))
	const t = 2 * Math.PI * u1
	return (r * Math.cos(t)) * stddev + mean
}

const ctx = document.querySelector('canvas').getContext('2d')
ctx.canvas.width = ctx.canvas.clientWidth
ctx.canvas.height = ctx.canvas.clientHeight
attachForm(config, document.querySelector('#form'), (config) => {
	ctx.setTransform([1, 0, 0, 1, 0, 0])
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	ctx.translate(ctx.canvas.width / 2, ctx.canvas.height)
	ctx.scale(3, 3)

	ctx.strokeStyle = config.color

	const n = Math.log((config.num + 1) / 2) / Math.log(1 + config.branchPrb)
	requestAnimationFrame(() => tree(ctx, config, n))
})

const tree = (ctx, config, n) => {
	if (n <= 0) return

	ctx.save()
	ctx.beginPath()
	ctx.moveTo(0, 0)
	ctx.translate(0, -20)
	ctx.lineTo(0, 0)
	ctx.stroke()

	const nBranches = Math.random() < config.branchPrb ? 2 : 1;
	for (let i = 0; i < nBranches; i++) {
		ctx.save()
		ctx.rotate(Math.random() - 0.5)
		const s = sampleNormal(config.scaling)
		ctx.scale(s, s)
		tree(ctx, config, n-1)
		ctx.restore()
	}

	ctx.restore()
}

