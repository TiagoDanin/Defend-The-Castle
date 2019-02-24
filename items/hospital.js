module.exports = {
	'7': {
		icon: '🏨',
		name: 'Hospital',
		city: true,
		desc: 'Increases a health.',
		doDb: (data, item) => {
			if (item.isInventory) return data
			console.log('>>>>>', data.life)
			data.life += Math.floor(50 * data.qt_hospital)
			return data
		},
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				'🏨 🚑'
			])
			data.life += Math.floor(70 * data.qt_hospital)
			return data
		},
		upgrade: [100, 'hospital']
	}
}
