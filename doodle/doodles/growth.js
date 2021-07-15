import { tweak, Prando } from '../lib.js'

export const config = () => tweak.describe(`
<pre>
<b>GROWTH</b>
</pre>`, {
    randomSeed: tweak.randomSeed(),
    years: tweak.integer(7),
    heart: tweak.maybe({
        ratio: tweak.integer(3),
        fade: 0.5,
    }, true),
    cells: {
        big: 4,
        small: 1.5,
        rand: 1,
        gamma: 2,
        spacing: 1,
    },
    rings: {
        big: 6,
        small: 2, 
        rand: 2,
    },
    divide: tweak.integer(10),
})

export function* setup({ config, canvas, ctx }) {
    const rng = new Prando(config.randomSeed)

    ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.translate(canvas.width / 2, canvas.height / 2)

    const cells = new Grid((config.cells.big + config.cells.rand) * 2)
    cells.insert({...zero, rad: config.cells.big})

    let outerCells = cells.circles.slice()
    for (let i = 0; i < config.years; i++) {
        const nCells = remap(i, 0, config.years-1, config.rings.big, config.rings.small) + rng.next(0, config.rings.rand)
        for (let j = 0; j < nCells; j++) {
            const l = Math.pow(j / nCells, config.cells.gamma)
            const radius = remap(l, 0, 1, config.cells.big, config.cells.small)
            const newCells = []
            for (let k = 0; k < config.divide; k++) {
                for (const cell of outerCells) {
                    const newRadius = radius + rng.next(0, config.cells.rand)
                    const dist = cell.rad + newRadius * rng.next(1, 2)
                    const newCell = {
                        ...add(cell, polar(rng.next(0, 2 * Math.PI), dist)),
                        rad: newRadius,
                        year: i,
                    }
                    if (!cells.find(newCell)) {
                        cells.insert(newCell)
                        newCells.push(newCell)
                    }
                }
            }
            outerCells = newCells
        
            draw(ctx, canvas, newCells, config)
            yield
        }
    }
}

const vec = (x, y) => ({x, y})
const polar = (t, r=1) => vec(Math.cos(t) * r, Math.sin(t) * r)
const zero = {x: 0, y: 0}
const add = (...vecs) => vecs.reduce((a, b) => vec(a.x + b.x, a.y + b.y))
const sub = (v0, v1) => vec(v0.x - v1.x, v0.y - v1.y)
const mag2 = ({x, y}) => x*x + y*y
const dist2 = (v0, v1) => {
    const dx = v0.x - v1.x
    const dy = v0.y - v1.y
    return dx*dx + dy*dy
}

function draw(ctx, canvas, cells, config) {
    ctx.fillStyle = '#333'
    for (const cell of cells) {
        ctx.globalAlpha = remap(cell.rad, config.cells.small, config.cells.big + config.cells.rand, 1, 0.4)
        if (config.heart && cell.year > config.years / config.heart.ratio) {
            ctx.globalAlpha *= config.heart.fade
        }
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.rad, 0, 2 * Math.PI)
        ctx.fill()
    }
}

function remap(v, a, b, c, d) {
    return c + (v - a) / (b - a) * (d - c)
}

class Grid {
    constructor(cellSize) {
        this.cellSize = cellSize
        this.cells = {}
        this.circles = []
    }

    insert(circle) {
        const hashes = this._hashes(circle)
        for (const h of hashes) {
            this.cells[h] = this.cells[h] ?? []
            this.cells[h].push(circle)
        }
        this.circles.push(circle)
    }

    find(bounds) {
        const hashes = this._hashes(bounds)
        for (const h of hashes) {
            if (this.cells[h]) {
                for (const circle of this.cells[h]) {
                    if (dist2(bounds, circle) < Math.pow(bounds.rad + circle.rad, 2)) {
                        return circle
                    }
                }
            }
        }
    }

    _hashes({ x, y, rad }) {
        const col = Math.floor(x / this.cellSize)
        const row = Math.floor(y / this.cellSize)
        const h = []
        for (let col = Math.floor((x - rad) / this.cellSize); col <= Math.floor((x + rad) / this.cellSize); col++) {
            for (let row = Math.floor((y - rad) / this.cellSize); row <= Math.floor((y + rad) / this.cellSize); row++) {
                h.push(`${col}|${row}`)
            }
        }
        return h
    }
}
