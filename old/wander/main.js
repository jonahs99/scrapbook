import { setup, draw } from './draw.js'

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

let last_time
function loop(time) {
	requestAnimationFrame(loop)	
	const delta = time - (last_time || time)
	last_time = time
	draw(context, delta)
}

function resize() {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
}

window.addEventListener('load', () => {
	resize()
	setup(context)
	requestAnimationFrame(loop)
})

window.addEventListener('resize', resize)
