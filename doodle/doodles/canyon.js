import { tweak, sample, Prando } from '../lib.js'

export function config() {
	return tweak.label('CANYON:', {
		random_seed: tweak.randomSeed(),

		r: 400,
		m: tweak.integer(1201),

        subdivide: {
            min_length: 12,
            prob: 0.25,
            rejoin: 0.1,
        },

        jitter: 0.1,
        momentum: 0.1,
        relax: 0.1,

		line: {
            draw_every: 24,
			width: 1,
            fade: 0.5,
		},
        curve: true,
		control_points: false,

        animate: false,
	})
}

export function* setup({ config, ctx, canvas }) {
	canvas.style.background = '#eee'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)

	const rng = new Prando(config.random_seed)

	//let pts = [vec(-config.r, 0), vec(-config.r / 3, 0), vec(config.r / 3, 0), vec(config.r, 0)]
	let pts = [vec(-config.r, 0), vec(0, 0), vec(config.r, 0)]
	//let pts = [vec(-config.r, 0), vec(0, -config.r / 3), vec(config.r, 0)]

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

        let exp = Math.pow(config.line.fade, (config.m - 1 - j) / config.line.draw_every)

        if (config.animate) {
            exp = 1
            ctx.save()
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.fillStyle = '#eee'
            ctx.globalAlpha = config.line.fade
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.restore()
        }

        if (config.curve && (j % config.line.draw_every == 0)) {
            if (exp > 0.001) {
                ctx.lineWidth = config.line.width / exp
                ctx.globalAlpha = 1 * exp
                ctx.beginPath()
                for (let i = 0; i < pts.length - 2; i++) {
                    const [a, b, c] = pts.slice(i, i + 3)
                    const ab = mid(a, b)
                    const bc = mid(b, c)
                    ctx.moveTo(ab.x, ab.y)
                    ctx.quadraticCurveTo(b.x, b.y, bc.x, bc.y)
                }
                ctx.stroke()
            }
        }

        if (config.animate && exp > 0.001) {
            yield
        }

        // subdivide

        /*
        if ((j + 1) % config.subdivide_every == 0) {
            pts = pts
                .slice(0, pts.length - 1)
                .flatMap((_, i) => {
                    const m = mid(pts[i], pts[i+1])
                    return [mid(pts[i], m), mid(m, pts[i+1])]
                })
        }
        */

        //const k = rng.nextInt(1, pts.length - 2)
        /*
        for (let k = pts.length - 3; k >= 1; k--) {
            const [a, b, c, d] = pts.slice(k-1, k+3)
            if (dist(b, c) > config.l) {
                const ab = mid(a, b)
                const bc = mid(b, c)
                const cd = mid(c, d)
                pts.splice(k, 2, mid(ab, b), mid(b, bc), mid(bc, c), mid(c, cd))
            }
        }
        */
        const subpts = pts
            .slice(0, pts.length - 1)
            .flatMap((_, i) => {
                const m = mid(pts[i], pts[i+1])
                return [mid(pts[i], m), mid(m, pts[i+1])]
            })
        pts = pts
            .flatMap((_, i) => {
                if (i == 0 || i == pts.length - 1) return [pts[i]]     
                if ((dist(pts[i-1], pts[i]) + dist(pts[i], pts[i+1])) / 2 > config.subdivide.min_length) {
                    if (rng.next() < config.subdivide.prob) {
                        return subpts.slice(i*2-1,i*2+1)
                    }
                }
                return [pts[i]]
            })

        // rejoin

        for (let i = 1; i < pts.length - 2; i++) {
            if (dist(pts[i], pts[i+1]) < config.subdivide.min_length * config.subdivide.rejoin) {
                pts.splice(i, 2, mid(pts[i], pts[i+1]))
                break
            }
        }

        // jitter

        for (let i = 1; i < pts.length - 1; i++) {
            const l = dist(pts[i-1], pts[i+1])
            const h = polar(heading(sub(pts[i+1], pts[i-1])) + Math.PI/2)
            const m = dot(sub(pts[i], mid(pts[i-1], pts[i+1])), h) * config.momentum
            const v = scale(h, m + rng.next(-1, 1) * config.jitter * l)
            pts[i] = add(pts[i], v)
        }

        // relax

        pts = pts.map((_, i) => {
            if (i==0 || i==pts.length-1) return pts[i]
            return add(scale(pts[i], 1 - config.relax), scale(pts[i-1], config.relax/2), scale(pts[i+1], config.relax/2))
        })
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
const dot = (u, v) => u.x * v.x + u.y * v.y
const dist = (u, v) => Math.sqrt(mag2(sub(u, v)))
const heading = ({x, y}) => Math.atan2(y, x)

const mid = (...vecs) => scale(add(...vecs), 1 / vecs.length)


