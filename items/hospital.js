module.exports = {
	'7': {
		icon: '🏨',
		name: 'Hospital',
		city: true,
		desc: 'Increases a health.',
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				'... ?'
			])
			data.life += Math.floor(
				Math.pow(100, Math.pow(data.qt_hospital, 0.071))
			)
			return data
		},
		upgrade: [170, 0.18, 'bank']
	}
}
