import { tweak, sample, Prando } from '../lib.js'

export function config() {
	return tweak.label('CANYON:', {
		random_seed: tweak.randomSeed(),
		r: 300,
		m: tweak.integer(10),
		momentum: 0.1,
		wander: 0.01,
		subdivide_prb: 0.1,

		line: {
			width: 2,
		},
		control_points: false,
	})
}

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.lineWidth = config.line.width

	const rng = new Prando(config.random_seed)

	let pts = [vec(-config.r, 0), vec(0, 0), vec(config.r, 0)]

	for (let j = 0; j < config.m; j++) {
		if (config.control_points) {
			ctx.save()
			ctx.beginPath()
			for (let i = 0; i < pts.length - 1; i++) {
				const [a, b] = pts.slice(i, i + 2)
				ctx.moveTo(a.x, a.y)
				ctx.lineTo(b.x, b.y)
			}
			ctx.strokeStyle = 'red'
			ctx.lineWidth = 1
			ctx.stroke()
			ctx.restore()
		}

		ctx.beginPath()
		for (let i = 0; i < pts.length - 2; i++) {
			const [a, b, c] = pts.slice(i, i + 3)
			const ab = mid(a, b)
			const bc = mid(b, c)
			ctx.moveTo(ab.x, ab.y)
			ctx.quadraticCurveTo(b.x, b.y, bc.x, bc.y)
		}
		ctx.stroke()

		// subdivide

		// const k = rng.nextInt(0, pts.length - 2)
		let k = 0;
		let d = dist(pts[0], pts[1])
		for (let i = 1; i < pts.length - 1; i++) {
			const di = dist(pts[i], pts[i+1])
			if (di > d) {
				k = i
				d = di
			}
		}
		pts.splice(k + 1, 0, mid(pts[k], pts[k+1]))

		// wander

		for (let i = 1; i < pts.length - 1; i++) {
			const l = dist(pts[i-1], pts[i+1])
			const d = polar(rng.next(0, 2*Math.PI), config.wander * l)
			let push = sub(pts[i], mid(pts[i-1], pts[i+1]))
			let mag_push = mag(push) || Infinity
			push = scale(push, config.momentum * l / mag_push)
			pts[i] = add(pts[i], d, push)
		}
	}
}

const vec = (x, y) => ({x, y})
const polar = (t, r=1) => vec(Math.cos(t) * r, Math.sin(t) * r)
const zero = {x: 0, y: 0}
const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
const sub = (u, v) => vec(u.x - v.x, u.y - v.y)
const scale = ({x, y}, a) => vec(x * a, y * a)
const mag2 = ({x, y}) => x*x + y*y
const mag = (v) => Math.sqrt(mag2(v))
const dist = (u, v) => Math.sqrt(mag2(sub(u, v)))
const heading = ({x, y}) => Math.atan2(y, x)

const mid = (...vecs) => scale(add(...vecs), 1 / vecs.length)


