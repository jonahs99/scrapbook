import { mountDoodle } from './doodle.js'

const scripts = [
	'coast',
	'flutter',
	'foliage',
	'fracture',
	'ganado',
	'meander',
	'tree',
	'twinkle',
	'wave',
	'sound-wave',
	'l-system',
]
const script = (scripts.includes(location.search.substr(1)) && location.search.substr(1).toLowerCase()) ||
	scripts[Math.floor(Math.random() * scripts.length)]

import(`./doodles/${script}.js`).then(doodle => {
	const canvas = document.querySelector('canvas')
	const configContainer = document.querySelector('.config-container')
	mountDoodle(doodle.default ?? doodle, canvas, configContainer)
})

