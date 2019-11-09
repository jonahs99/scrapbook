/* setup is called once at the beginning of the session */

let particles = []

function setup() {
	// set the background color
	document.body.style.background = '#111'

}


/* draw is called once each frame */

function draw(delta) {

	delta *= 0.04

	// clear the canvas
	context.setTransform(1, 0, 0, 1, 0, 0)
	context.clearRect(0, 0, canvas.width, canvas.height)

	// center the canvas	
	context.translate(canvas.width / 2, canvas.height / 2)

	context.globalCompositeOperation = 'lighter'
	context.fillStyle = '#ff7744'

	particles.forEach(part => {
		context.globalAlpha = 1 - Math.exp(-part.r * 0.1)

		context.beginPath()
		context.arc(part.pos.x, part.pos.y, part.r, 0, Math.PI * 2)
		context.fill()

		part.pos.x += part.vel.x * delta
		part.pos.y += part.vel.y * delta

		part.vel.y -= 0.04 * delta * delta
		part.vel.x -= 0.0002 * part.pos.x * delta * delta * part.r

		part.vel.x *= 0.99
		part.vel.y *= 0.98

		part.r *= 0.98
	})

	particles = particles.filter(part => part.r > 1)

	const t = Math.random() * 2 * Math.PI
	const s = 2 + Math.random()
	particles.push({
		pos: {x: 0, y: 0},
		vel: {x: s * Math.cos(t), y: s * Math.sin(t)},
		r: 12 + Math.random() * 8,
	})
}

/* boilerplate */

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

/* the main loop */

let last_time

function loop() {
	requestAnimationFrame(loop)	

	const now = Date.now()
	draw(now - last_time)
	last_time = now
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
