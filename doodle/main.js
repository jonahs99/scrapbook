import { mountDoodle } from './doodle.js'

const searchParams = new URLSearchParams(location.search)
const name = searchParams.get('doodle')

const hashParams = new URLSearchParams(location.hash.replace('#', '?'))
const configStr = hashParams.get('config')
let config

if (configStr) {
	try {
		config = JSON.parse(decodeURIComponent(configStr))
	} catch (e) { }
	// Clear the hash from the url
	history.replaceState('', document.title, location.pathname + location.search)
}

const canvas = document.querySelector('canvas')
const configContainer = document.querySelector('.config-container')
mountDoodle(name, canvas, configContainer, config)

