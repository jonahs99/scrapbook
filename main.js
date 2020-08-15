import { mountDoodle } from './doodle.js'

const scripts = ['wave', 'tree', 'flutter', 'ganado']
const script = (scripts.includes(location.search.substr(1)) && location.search.substr(1)) ||
	scripts[Math.floor(Math.random() * scripts.length)]

import(`./doodles/${script}.js`).then(doodle => {
	const canvas = document.querySelector('canvas')
	const configContainer = document.querySelector('.config-container')
	mountDoodle(doodle, canvas, configContainer)
})
