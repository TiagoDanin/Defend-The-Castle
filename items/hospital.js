module.exports = {
	7: {
		icon: '🏨',
		name: 'Hospital',
		city: true,
		desc: 'Increases a health.',
		battle: false,
		price: 50,
		qt: 1,
		doDb: (data, item) => {
			if (item.isInventory) {
				return data
			}

			data.life += Math.floor(50 * data.qt_hospital)
			return data
		},
		doDefend: (data, ctx) => {
			const qt = data.city.filter((id, index) => id == '7' && index != 12).length
			console.log(qt)
			ctx.db.log.push([
				ctx._`🏨 🚑`
			])
			data.life += Math.floor(70 * (data.qt_hospital / qt))
			return data
		},
		upgrade: [100, 'hospital']
	}
}
