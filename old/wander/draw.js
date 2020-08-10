import Prando from 'https://unpkg.com/prando?module'

let scl = 0.7
let br = 1

export function setup(ctx) {
	// set the background color
	ctx.canvas.style.background = '#181818'
}

export function draw(ctx, _delta) {
	// clear the canvas
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	// center the canvas	
	ctx.translate(ctx.canvas.width / 2, ctx.canvas.height * 2/3)

	const z = 0.6
	ctx.scale(z, z)

	ctx.rotate(-Math.PI / 2)
	tree(ctx, 20)
}

function tree(ctx, n) {
	if (n <= 0) return

	ctx.strokeStyle = '#ffd500'
	ctx.lineWidth = 8

	const l = rand(n, 50, 100)
	const r = rand(n, 20, 100)
	const t = rand(n, -1, 1)

	const x = l + Math.cos(t) * r
	const y = Math.sin(t) * r

	ctx.beginPath()
	ctx.moveTo(0, 0)
	ctx.quadraticCurveTo(l, 0, x, y)
	ctx.stroke()

	const s = rand(n, scl, 1)

	const b = rand(n, 0, 1) < br ? 2 : 1;

	for (let i = 0; i < b; i++) {
		ctx.save()
		ctx.translate(x, y)
		ctx.rotate(t)
		ctx.scale(s, s)
		tree(ctx, n-1)
		ctx.restore()
	}
}

const rand_table = []
const rng = new Prando(1)
for (let i = 0; i < 1024 * 1024; i++) {
	rand_table.push(rng.next())
}

function rand(key, a, b) {
	const r = rand_table[key % rand_table.length]
	return a + r * (b - a)
}
