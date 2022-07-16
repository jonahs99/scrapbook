import { tweak, sample, Prando } from '../lib.js'

export function config() {
	return tweak.label('CANYON:', {
		random_seed: tweak.randomSeed(),

		r: 800,
		m: tweak.integer(4),
		subdivide_every: tweak.integer(2),

        jitter: 0.3,
        momentum: 0.1,
        // bias: 1,

		line: {
			width: 2,
            fade: 0.7,
		},
        curve: true,
		control_points: false,
	})
}

export function setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)

	const rng = new Prando(config.random_seed)

	let pts = [vec(-config.r, 0), vec(0, 0), vec(config.r, 0)]

	for (let j = 0; j < config.m; j++) {
		if (config.control_points && j == config.m - 1) {
			ctx.save()
            ctx.globalAlpha = 1

			ctx.beginPath()
			for (let i = 0; i < pts.length - 1; i++) {
				const [a, b] = pts.slice(i, i + 2)
				ctx.moveTo(a.x, a.y)
				ctx.lineTo(b.x, b.y)
			}
			ctx.strokeStyle = '#f66'
			ctx.lineWidth = 1
			ctx.stroke()

            ctx.fillStyle = '#f66'
			for (let i = 0; i < pts.length; i++) {
                ctx.beginPath()
				ctx.arc(pts[i].x, pts[i].y, 2, 0, 2 * Math.PI)
                ctx.fill()
			}
			ctx.restore()
		}

        if (config.curve) {
            ctx.beginPath()
            for (let i = 0; i < pts.length - 2; i++) {
                const [a, b, c] = pts.slice(i, i + 3)
                const ab = mid(a, b)
                const bc = mid(b, c)
                ctx.moveTo(ab.x, ab.y)
                ctx.quadraticCurveTo(b.x, b.y, bc.x, bc.y)
            }
            const exp = Math.pow(config.line.fade, config.m - 1 - j)
            console.log(exp)
            ctx.lineWidth = config.line.width / exp
            ctx.globalAlpha = 1 * exp
            ctx.stroke()
        }

        // subdivide

        if ((j + 1) % config.subdivide_every == 0) {
            pts = pts
                .slice(0, pts.length - 1)
                .flatMap((_, i) => {
                    const m = mid(pts[i], pts[i+1])
                    return [mid(pts[i], m), mid(m, pts[i+1])]
                })
        }

        // jitter

        for (let i = 1; i < pts.length - 1; i++) {
            const l = dist(pts[i-1], pts[i+1])
            const h = heading(sub(pts[i+1], pts[i-1]))
            const j = polar(h + Math.PI/2, rng.next(-l*config.jitter, l*config.jitter))
            const m = scale(sub(pts[i], mid(pts[i-1], pts[i+1])), config.momentum)
            pts[i] = add(pts[i], j, m)
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


