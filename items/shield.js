module.exports = {
	12: {
		icon: '🛡',
		name: 'Super Shield',
		desc: '3x +Shield & +150 Xp',
		city: false,
		battle: true,
		price: 1,
		qt: 3,
		summon: (data, ctx) => {
			data.xp += 150
			data.shield += data.shield * 2
			ctx.db.log.push([
				ctx._`🛡 Super Shield used!`
			])
			return data
		}
	}
}
