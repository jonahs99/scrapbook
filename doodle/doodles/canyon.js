import { tweak, sample, Prando } from '../lib.js'

export function config() {
	return tweak.label('TREE:', {
		random_seed: tweak.randomSeed(),
		n: 10,
		spacing: 100,
		wander: 10,
		decay: 1,
		meander: 1, 
		m: tweak.integer(10),

		line: {
			width: 4,
			decay: 0.9,
		},
	})
}

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.lineWidth = config.line.width

	const rng = new Prando(config.random_seed)

	const pts = []
	const vs = []
	for (let i = 0; i < config.n; i++) {
		const p = vec(i * config.spacing - (config.n - 1) * config.spacing / 2, 0)
		pts.push(p)
		const v = polar(rng.next(0, 2 * Math.PI), config.wander)
		vs.push(v)
	}

	for (let j = 0; j < config.m; j++) {	
		/*
		for (let i = 0; i < pts.length; i++) {
			pts[i].y += rng.next(-config.meander, config.meander)
		}
		*/
		for (let i = 0; i < pts.length; i++) {
			pts[i] = add(pts[i], vs[i])
			vs[i] = scale(vs[i], config.decay)
		}

		ctx.beginPath()
		ctx.moveTo(pts[0].x, pts[0].y)
		for (let i = 1; i < pts.length - 1; i++) {
			const [a, b, c] = pts.slice(i - 1, i + 2)
			const d = mid(b, c)
			ctx.quadraticCurveTo(b.x, b.y, d.x, d.y)
		}
		ctx.stroke()

		ctx.lineWidth *= config.line.decay
	}
}

const vec = (x, y) => ({x, y})
const polar = (t, r=1) => vec(Math.cos(t) * r, Math.sin(t) * r)
const zero = {x: 0, y: 0}
const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
const scale = ({x, y}, a) => vec(x * a, y * a)
const mag2 = ({x, y}) => x*x + y*y
const heading = ({x, y}) => Math.atan2(y, x)

const mid = (...vecs) => scale(add(...vecs), 1 / vecs.length)


