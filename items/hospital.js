module.exports = {
	'7': {
		icon: '🏨',
		name: 'Hospital',
		city: true,
		desc: 'Increases a health.',
		battle: false,
		price: 50,
		qt: 1,
		doDb: (data, item) => {
			if (item.isInventory) return data
			data.life += Math.floor(50 * data.qt_hospital)
			return data
		},
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				ctx._`🏨 🚑`
			])
			data.life += Math.floor(70 * data.qt_hospital)
			return data
		},
		upgrade: [100, 'hospital']
	}
}
