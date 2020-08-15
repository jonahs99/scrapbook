import { render as renderTemplate } from 'https://unpkg.com/lit-html?module'

export const render = ({ value, template }, el, onChange) => {
	const renderValue = (value) => {
		renderTemplate(template(value, renderValue), el)
		onChange && onChange(value, renderValue)
	}
	renderValue(value)
}

