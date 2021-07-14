import { mountDoodle } from './doodle.js'

const params = new URLSearchParams(window.location.search)
const name = params.get('doodle')

const canvas = document.querySelector('canvas')
const configContainer = document.querySelector('.config-container')
mountDoodle(name, canvas, configContainer)

