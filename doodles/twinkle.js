import { tweak, Prando } from '../lib.js';

let rng
let pts

export default tweak.doodle(() => ({
    randomSeed: tweak.randomSeed(),
    n: tweak.integer(100),
    w: 400,
    
    A: 10,
    S: 100,
    f: 10,
    clc: 1,
}), {
    setup({ ctx, canvas, config }) {
        canvas.style.background = '#eee'

        const { n, w } = config

        rng = new Prando(config.randomSeed)

        pts = []
        for (let i = 0; i < n; i++) {
            pts.push(xyz(
                rng.next(-w, w),
                rng.next(-w, w),
                rng.next(-w, w),
            ))
        }
    },

    draw({ ctx, canvas, config }) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.scale(1, -1)

        for (let i = 0; i < pts.length; i++) {
            pts[i] = add(
                pts[i],
                xyz(rng.next(-1, 1), -0.2 + rng.next(-1, 1), rng.next(-1, 1)),
            )
        }

        const { n, w, A, S, f, clc } = config

        // const time = Date.now() / 1000

        // const s = xyz(Math.cos(time) * 400, 300, Math.sin(time) * 400)
        // const d = sub(xyz(Math.sin(time) * 400, -300, Math.cos(time) * 400), s)

        // const line = [s, d]

        for (const p of pts) {
            // const t = rng.next()
            // const p = ln(line, t)

            const s = S - p.z
            const c = A * Math.abs(s - S) / S * f / (S - f) + clc

            ctx.beginPath()
            ctx.arc(p.x, p.y + 0.1 * p.z, c, 0, 2 * Math.PI)
            ctx.fillStyle = '#222'
            ctx.globalAlpha = Math.min(1, 10 / Math.pow(c, 2))
            ctx.fill()
        }
    }
})

const xyz = (x, y, z) => ({x, y, z})
const add = (u, v) => xyz(u.x + v.x, u.y + v.y, u.z + v.z)
const scl = (v, a) => xyz(v.x * a, v.y * a, v.z * a)
const sub = (u, v) => add(u, scl(v, -1))

const ln = ([s, d], t) => add(s, scl(d, t))
