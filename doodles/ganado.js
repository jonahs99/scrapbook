import { tweak } from 'https://cdn.jsdelivr.net/gh/jonahs99/doodle/lib.js'

export function config() {
	return tweak.label('Ganado:', {
		iterations: tweak.integer(36),
		decay: 0.9,
		length: 180,
		angle: 5,
	})
}

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.rotate(-Math.PI / 2)

	ctx.lineWidth = 6;

	tree({ config, ctx })
}

function tree({ config, ctx }, n = config.iterations) {
	if (n <= 0) return

	const l = config.length
	const t = config.angle
	const midpt = { x: l, y: 0 }
	const endpt = { x: midpt.x + l * Math.cos(t), y: l * Math.sin(t) }

	ctx.save()

	ctx.beginPath()
	ctx.moveTo(0, 0)
	//ctx.quadraticCurveTo(midpt.x, midpt.y, endpt.x, endpt.y)
	ctx.lineTo(endpt.x, endpt.y)
	ctx.stroke()

	ctx.translate(endpt.x, endpt.y)
	ctx.rotate(t)
	ctx.scale(config.decay, config.decay)

	tree({ config, ctx }, n - 1)

	ctx.restore()
}
