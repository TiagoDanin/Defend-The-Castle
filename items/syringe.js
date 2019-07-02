module.exports = {
	13: {
		icon: '💉',
		name: 'Syringe',
		desc: '2x +Shield & 2x +Life',
		city: false,
		battle: true,
		price: 1,
		qt: 2,
		summon: (data, ctx) => {
			data.shield += data.shield * 2
			data.life += data.life * 2
			ctx.db.log.push([
				ctx._`💉 Syringe used!`
			])
			return data
		}
	}
}
