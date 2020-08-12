import { tweak } from 'https://cdn.jsdelivr.net/gh/jonahs99/doodle/lib.js'

export function config() {
	return tweak.label('FLUTTER:', {
		rows: tweak.integer(3),
		cols: tweak.integer(3),
		size: 160,
		color: '#c00',
	})
}

export function setup({ canvas }) {
	canvas.style.background = '#eee'
}

export function draw({ config, ctx, canvas }) {
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.translate(canvas.width / 2, canvas.height / 2)

	// ctx.fillStyle = '#0044ffaa'
	ctx.fillStyle = config.color
	ctx.strokeStyle = ctx.fillStyle

	const l = config.size
	const h = l * Math.sqrt(3) / 2

	const pos = ([i, j]) => [h * i, i % 2 ? l * (j + 0.5) : l * j]

	ctx.translate(-l * (config.cols - 1) / 2, -h * (config.rows - 1) / 2)

	for (let i = 0; i < config.rows; i++) {
		for (let j = 0; j < (i % 2 ? config.cols - 1 : config.cols); j++) {
			const [y, x] = pos([i, j])

			const n = Date.now() / 1000
			// const r = 3 * (Math.sin(x + n) + Math.cos(y + 2 * n) + 2)
			const r = 4

			ctx.save()
			ctx.translate(x, y)

			for (let a = 0; a < 6; a++) {
				const t = Math.PI / 3 * a

				// position of this 'pixel'
				const sx = (x + Math.cos(t + Math.PI/6) * 2/3*h) / l / 4
				const sy = (y + Math.sin(t + Math.PI/6) * 2/3*h) / l / 4	

				const wx = Math.sin(n * 0.4) + Math.cos(n * 0.5)
				const wy = 0.6 * Math.sin(n * 0.11) + Math.cos(n * 0.34)
				const w = Math.sin(3*Math.pow((sx-wx)*(sx-wx)+(sy-wy)*(sy-wy), 0.8) + 0.03*n)

				ctx.save()
				ctx.rotate(t)
				ctx.beginPath()
				ctx.moveTo(0, 0)
				ctx.lineTo(l, 0)
				ctx.lineTo(l/2, h/3 * Math.cos(w))
				ctx.closePath()
				// ctx.fillStyle = ctx.strokeStyle = a%2 ?
				//	'#ffd500' : '#ff9500'
				ctx.globalAlpha = Math.cos(w) * 0.5 + 0.5
				ctx.fill()
				//ctx.stroke()
				ctx.restore()
			}

			ctx.restore()
		}
	}

}

