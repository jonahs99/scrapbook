import { tweak, Prando } from '../lib.js'

export default tweak.doodle(() => tweak.label('MEANDER:', {
    randomSeed: tweak.randomSeed(),
    n: tweak.integer(20),
    h: 10,
    speed: 20,
    attraction: 1,
    mass: 100,
    g: 0.1,
    iters: tweak.integer(20),
    reps: tweak.integer(20),
}), {
    setup({ ctx, canvas, config }) {
        console.log(config.expr)

        canvas.style.background = '#eee'

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.translate(canvas.width / 2, 0)

        const rng = new Prando(config.randomSeed)
        
        let pts = []
        for (let i = 0; i < config.n; i++) {
            const x = rng.next(-config.h, config.h)
            pts.push(xy(x, (i + 0.5) / config.n * canvas.height))
        }

        for (let j = 0; j < config.reps; j++) {
            // for (const pt of pts) {
            //     ctx.beginPath()
            //     ctx.arc(pt.x, pt.y, 1, 0, 2 * Math.PI)
            //     ctx.fillStyle = '#222'
            //     ctx.fill()
            // }
    
            pts.push(add(scl(pts[pts.length - 2], -99), scl(pts[pts.length - 1], 100)))

            let part = xy(rng.next(-config.h, config.h), 0)
            let vel = xy(0, config.speed)
            let parts = [part]
            for (let i = 0; i < config.iters; i++) {
                const acc = scl(sub(closest(part, pts), part), config.attraction / config.mass)
                vel = add(vel, acc, xy(0, config.g))
                part = add(part, vel)
                parts.push(part)
            }

            ctx.save()
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.fillStyle = '#eee'
            ctx.globalAlpha = 0.04
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.restore()

            ctx.beginPath()
            for (const pt of parts) {
                ctx.lineTo(pt.x, pt.y)
            }
            ctx.stroke()

            pts = parts
        }
    },
})

function closest(pt, pts) {
    let pClose, dClose
    for (let i = 0; i < pts.length - 1; i++) {
        const ray = [pts[i], sub(pts[i + 1], pts[i])]
        const t = dot(sub(pt, pts[i]), ray[1]) / mag2(ray[1])
        if (t >= 0 && t < 1) {
            const p = ln(ray, t)
            const d = mag2(sub(p, pt))
            if (!pClose || d < dClose) {
                pClose = p
                dClose = d
            }
        }
    }
    for (const p of pts) {
        const d = mag2(sub(p, pt))
        if (!pClose || d < dClose) {
            pClose = p
            dClose = d
        }
    }
    return pClose
}

const xy = (x, y) => ({x, y})
const add = (...vs) => vs.reduce((u, v) => xy(u.x + v.x, u.y + v.y))
const scl = ({x, y}, a) => xy(x * a, y * a)
const sub = (u, ...vs) => add(u, ...vs.map((v) => scl(v, -1)))

const dot = (u, v) => u.x * v.x + u.y * v.y
const mag2 = (v) => dot(v, v)
const mag = (v) => Math.sqrt(mag2(v))
const proj = (u, v) => dot(u, v) / mag(u) / mag(v)

const ln = ([s, d], t) => add(s, scl(d, t))
