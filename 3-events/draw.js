/* setup is called once at the beginning of the session */

let events = null

const colors = {
	'Severe Storms': 'blue',
	'Volcanoes': 'red',
	'Wildfires': 'orange',
}

function fetchAll(limits) {
	if (!limits.length) return

	const limit = limits[0]
	limits = limits.slice(1)

	const endpoint = `https://eonet.sci.gsfc.nasa.gov/api/v2.1/events?status=closed&limit=${limit}`
	fetch(endpoint)
		.then((response) => response.json())
		.then((data) => {
			events = data.events

			fetchAll(limits)
			console.log('retrieved', events.length, 'events')
		})
}

function setup() {

	// set the background color
	canvas.style.background = '#eee'

	fetchAll([40, 100, 500, 1000])
}


/* draw is called once each frame */

function draw(delta) {
	
	// clear the canvas
	context.setTransform(1, 0, 0, 1, 0, 0)
	context.clearRect(0, 0, canvas.width, canvas.height)

	// center the canvas	
	context.translate(canvas.width / 2, canvas.height / 2)
	context.scale(4, 4)

	context.globalAlpha = 0.2

	if (events) {
		for (const ev of events) {
			if (!ev.geometries) continue

			const clr = colors[ev.categories[0].title] || 'green';

			context.fillStyle = clr

			const coords = ev.geometries.map((geo) => geo.coordinates);

			let r = 1.5
			for (const coord of coords) {
				context.lineTo(coord[0], coord[1])
				context.beginPath()
				context.arc(coord[0], coord[1], r, 0, Math.PI * 2)
				context.fill()

				r *= 0.95
			}
		}
	} else {
		context.textAlign = 'center'
		context.fillText('waiting for data...', 0, 0)
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
