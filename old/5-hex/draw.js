/* setup is called once at the beginning of the session */

function setup() {

	// set the background color
	canvas.style.background = '#181818'

	// TODO: Initialize something!

}


/* draw is called once each frame */

function draw(delta) {
	
	// clear the canvas
	context.setTransform(1, 0, 0, 1, 0, 0)
	context.clearRect(0, 0, canvas.width, canvas.height)

	// center the canvas	
	context.translate(canvas.width / 2, canvas.height / 2)

	context.fillStyle = '#ffd500'
	context.strokeStyle = context.fillStyle

	const l = 80
	const h = l * Math.sqrt(3) / 2

	const pos = ([i, j]) => [h * i, i % 2 ? l * (j + 0.5) : l * j]

	for (let i = -6; i <= 7; i++) {
		for (let j = -10; j <= (i % 2 ? 9 : 10); j++) {
			const [y, x] = pos([i, j])

			const n = Date.now() / 1000
			// const r = 3 * (Math.sin(x + n) + Math.cos(y + 2 * n) + 2)
			const r = 4

			context.save()
			context.translate(x, y)

			for (let a = 0; a < 6; a++) {
				const t = Math.PI / 3 * a

				// position of this 'pixel'
				const sx = (x + Math.cos(t + Math.PI/6) * 2/3*h) / l / 4
				const sy = (y + Math.sin(t + Math.PI/6) * 2/3*h) / l / 4	

				const wx = Math.sin(n * 0.4) + Math.cos(n * 0.5)
				const wy = 0.6 * Math.sin(n * 0.11) + Math.cos(n * 0.34)
				const w = Math.sin(3*Math.pow((sx-wx)*(sx-wx)+(sy-wy)*(sy-wy), 0.8) + 0.03*n)

				context.save()
				context.rotate(t)
				context.beginPath()
				context.moveTo(0, 0)
				context.lineTo(l, 0)
				context.lineTo(l/2, h/3 * Math.cos(w))
				context.closePath()
				//context.fillStyle = context.strokeStyle = a%2 ?
				//	'#ffd500' : '#ff9500'
				context.fill()
				//context.stroke()
				context.restore()
			}

			context.restore()
		}
	}

}


/* boilerplate */

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

/* the main loop */

let last_time

function loop() {
	requestAnimationFrame(loop)	
	
	const delta = Date.now() - last_time
	draw(delta)
}

function resize() {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
}

window.addEventListener('load', () => {
	resize()

	setup()

	last_time = Date.now()

	requestAnimationFrame(loop)
})

window.addEventListener('resize', resize)
