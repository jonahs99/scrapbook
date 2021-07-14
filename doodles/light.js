import { tweak } from '../lib.js'

const TAU = 2 * Math.PI

export const config = () =>
	tweak.label('QUANTUM LIGHT TABLE:', {
		d: 10,
        freq: 0.1,
        n: 1000,
        steps: 100,
        screen: {
            size: 100,
            distance: 50,
            count: 50,
        },
        wall: {
            size: 30,
            distance: 20,
            gap: 10,
        },
        zoom: 3,
	})

export function* setup({ config, canvas, ctx }) {
    const { d, freq, n, steps, screen, wall, zoom } = config

	canvas.style.background = '#111'

	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(zoom, zoom)

    const screens = [
        // [{x: -1, y: -100}, {x: 0, y: 200}],
        // [{x: wall.distance, y: -wall.gap/2}, {x: 0, y: -wall.size/2}],
        // [{x: wall.distance, y: wall.gap/2}, {x: 0, y: wall.size/2}],
    ]
    const w = screen.size / screen.count
    for (let i = 0; i < screen.count; i++) {
        screens.push([
            {x: screen.distance, y: -screen.size/2 + w * i},
            {x: 0, y: w},
        ])
    }

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 0.1
    ctx.globalAlpha = 0.1
    for (let i = 0; i < n; i++) {
        let p = Math.random() < 0.5 ? {x: 0, y: -5} : { x: 0, y: 5}
        let a = 0
        let pts = [p]
        for (let j = 0; j < steps; j++) {
            const vel = polar(Math.random() * TAU, d)

            // Search for hits
            let t = 1
            let target
            for (const screen of screens) {
                const h = hit([p, vel], screen)
                if (!isNaN(h) && h > 0 && h < t) {
                    t = h
                    target = screen
                }
            }

            a += freq * t

            if (target) {
                target.hits = add(target.hits ?? zero, polar(a, 1))
                break
            }

            p = add(p, vel)
            pts.push(p)
        }
        drawCurve(ctx, pts)

        // if ((i + 1) % 1000 === 0) {
        //     yield
        // }
    }

    let maxp = 0
    for (const screen of screens) {
        const p = mag2(screen.hits ?? zero)
        if (p > maxp) {
            maxp = p
        }
    }

    ctx.lineWidth = 1
    ctx.strokeStyle = '#f88'
    for (const screen of screens) {
        const [start, dir] = screen
        const p = mag2(screen.hits ?? zero)
        ctx.globalAlpha = p / maxp
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(start.x + dir.x, start.y + dir.y)
        ctx.stroke()
    }
}

function drawCurve(ctx, pts) {
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    for (let i = 1; i < pts.length - 1; i++) {
        const mid = scale(add(pts[i], pts[i+1]), 0.5)
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y)
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y)
    ctx.stroke()
}

const vec = (x, y) => ({x, y})
const polar = (t, r=1) => vec(Math.cos(t) * r, Math.sin(t) * r)
const zero = {x: 0, y: 0}
const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
const scale = ({x, y}, a) => vec(x * a, y * a)
const mag2 = ({x, y}) => x*x + y*y
const heading = ({x, y}) => Math.atan2(y, x)
const hit = (ray, seg) => {
    const dx = seg[0].x - ray[0].x
    const dy = seg[0].y - ray[0].y
    const det = seg[1].x * ray[1].y - seg[1].y * ray[1].x
    const u = (dy * seg[1].x - dx * seg[1].y) / det
    const v = (dy * ray[1].x - dx * ray[1].y) / det
    return (v >= 0 && v < 1) ? u : Number.NaN
}