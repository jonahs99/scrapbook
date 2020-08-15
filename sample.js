export function sample(distr, rng) {
	if (distr.constant) {
		rng.skip(2)
		return distr.constant
	} else if (distr.uniform) {
		const { min, max } = distr.uniform
		rng.skip(1)
		return rng.next(min, max)
	} else if (distr.normal) {
		const u0 = rng.next()
		const u1 = rng.next()
		const r = Math.sqrt(-2 * Math.log(u0))
		const t = 2 * Math.PI * u1
		const { mean = 0, stddev = 1 } = distr.normal
		return (r * Math.cos(t)) * stddev + mean
	}
}

