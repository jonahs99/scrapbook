/* setup is called once at the beginning of the session */

function setup() {

	// set the background color
	canvas.style.background = '#eee'

	// TODO: Initialize something!

}


/* draw is called once each frame */

function draw(delta) {
	
	// clear the canvas
	context.setTransform(1, 0, 0, 1, 0, 0)
	context.clearRect(0, 0, canvas.width, canvas.height)

	// center the canvas	
	context.translate(canvas.width / 2, canvas.height / 2)

	context.save()

	const n = 12
	const space = 32

	context.translate(-(n - 1)/2 * space, -(n - 1)/2 * space)

	context.fillStyle = '#113'
	context.globalAlpha = 0.2
	context.globalCompositeOperation = 'lighter'

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			const cj = (Math.sin( Date.now() * 0.0007 ) + 1) * n
			const ci = (Math.sin( Date.now() * 0.0008 ) + 1) * n
			const l = Math.pow(cj - j, 2) + Math.pow(ci - i, 2)
			const r = (Math.sin( Date.now() * 0.001 + i + 7 * j + l * 0.01 ) + 2) * 8

			const x = j * space
			const y = i * space
			context.beginPath()
			context.rect(x-r, y-r, r*2, r*2)
			context.fill()
		}
	}

	context.restore()

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
