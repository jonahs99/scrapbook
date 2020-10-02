import f from 'flyd'
import lift from 'flyd/module/lift'
import * as tweak from '../lib/tweak'

const doodle = {
	makeInput: () => ({
		mult: 4,
		alpha: tweak.slider(16),

		speed: tweak.slider(2),
		spacing: tweak.slider(12),
		spread: tweak.slider(8),

		mic: tweak.mic({
			fftSize: 2048,
			smoothingTimeConstant: 0.1,
		}),
	}),

	program: ({ mult, alpha, speed, spacing, spread, mic }) => {
		let theta = 0
		let r = 1
		return f.merge(
			f.stream(ctx => {
				ctx.setTransform(1, 0, 0, 1, 0, 0)
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
				ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
				ctx.globalCompositeOperation = 'multiply'
			}),
			lift(freq => ctx => {
				const bins = freq.length / 2

				const dt = speed() / Math.max(r, 1)
				theta += dt
				r += dt * spacing()
				for (let i = 0; i < bins; i++) {
					const freqi = (i + 1) * (24000 / freq.length)

					if (freqi < 55 || freqi > 5000) continue

					const note = Math.log(freqi / 55) / Math.log(2)
					// const distanceToCenter = r + (note - Math.floor(note)) * 64
					const distanceToCenter = r + note * spread()
					
					const x = distanceToCenter * Math.cos(theta)
					const y = distanceToCenter * Math.sin(theta)

					const v = Math.max(0, (freq[i] + 90) * mult())

					const b = v / 40
					const c = (i / bins) * 200

					ctx.beginPath()
					ctx.arc(x, y, b, 0, 2 * Math.PI)
					ctx.globalAlpha = alpha() / 100
					ctx.fillStyle = `rgb(${c},${40},${200 - c})`
					ctx.fill()
				}
			}, mic)
		)
	}
}

// MAIN

import { render } from 'lit-html'

const ctx = document.querySelector('canvas').getContext('2d')
const configContainer = document.querySelector('.config-container')

const resize = () => {
	ctx.canvas.width = ctx.canvas.parentElement.offsetWidth
	ctx.canvas.height = ctx.canvas.parentElement.offsetHeight
}
resize()
window.addEventListener('resize', resize)

const renderView = f.on(template => render(template, configContainer))

const module = doodle
const { makeInput, program } = module

const input = tweak.field(makeInput())

renderView(input.view$())
f.on(fn => fn(ctx), program(input))
