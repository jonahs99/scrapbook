function randInt(m) {
	return Math.floor(Math.random() * m)
}

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const w = 1024
const h = 1000

canvas.style.background = 'black'
canvas.style.width = '${w}px'
canvas.style.height = '${h}px'

canvas.width = w
canvas.height = h

let row = 0
let state = []

function paint() {
	if (row === 0) {
		state = []
		for (let i = 0; i < w; i++) state.push(`#${Math.random().toString(16).slice(2, 8)}`) 
	}

	for (let j = 0; j < w; j++) {
		const g = Math.floor(state[j] * 255)
		ctx.fillStyle = state[j];//`rgb(${g}, ${g}, ${g})`
		ctx.fillRect(j, row, 1, 1)
	}

	const r = 1
	state = state.map((_, j, a) => state[(j - r + randInt(2 * r + 1) + w) % w])

	row = (row + 1) % h

	requestAnimationFrame(paint)
}

paint()
