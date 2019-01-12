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
			data.life += Math.floor(Math.pow(100, Math.pow(data.qt_hospital, 0.05)))
			return data
		},
		upgrade: [190, 0.2, 'bank']
	}
}
