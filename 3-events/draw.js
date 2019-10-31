/* setup is called once at the beginning of the session */

const beginTime = Date.now()

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
	canvas.style.background = '#111'

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

	context.globalAlpha = 0.6

	if (events) {
		const startDate = (new Date('2016')).valueOf()
		const w = beginTime - startDate;
		//const t = (Date.now() * 1000) % (Date.now() - startDate) + startDate
		const t = ((Date.now() - beginTime) * 3000000) % w + startDate

		for (const ev of events) {
			if (!ev.geometries) continue

			const d = (new Date(ev.closed)).valueOf() / t

			const clr = colors[ev.categories[0].title] || 'green';

			context.fillStyle = clr

			const coords = ev.geometries.map((geo) => geo.coordinates);

			let r = 3 * (1 / (1 + 1000000 * (d - 1) * (d - 1)))
			for (const coord of coords) {
				//const rc = r * (Math.sin(Date.now() * 0.001 + coord[0] * 0.01 + coord[1] * 0.007) / 4 + 1);
				const rc = r

				context.lineTo(coord[0], coord[1])
				context.beginPath()
				context.arc(coord[0], coord[1], rc, 0, Math.PI * 2)
				context.fill()

				r *= 0.95
			}
		}

		context.textAlign = 'right'
		context.fillStyle = 'white'
		const date = new Date(t)
		context.fillText(date.toString().split('GMT')[0], 100, 100)
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
