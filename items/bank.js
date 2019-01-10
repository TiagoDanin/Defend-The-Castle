const price = (data) => {
	return {
		upgrade: Math.round(Math.pow(100, Math.pow(data.qt_bank+1, 0.2)))
	}
}

module.exports = {
	'5': {
		icon: '🏦',
		name: 'Bank',
		city: true,
		desc: 'Gerar dinheiro para o castelo.',
		price: price,
		doDb: (data) => {
			var banks = data.city.filter((e) => e == 5).length
			data.moneyPerHour = Math.round((Math.pow(100, Math.pow(data.qt_bank, 0.092)) * banks))
			return data
		},
		doTime: (data) => {
			var moneyPerSecond = (data.moneyPerHour / 60) / 60
			data.money = data.timerunning * moneyPerSecond
			return data
		},
		upgrade: (ctx) => {
			if (ctx.db.money >= price(ctx.db).upgrade) {
				return true
			}
			return false
		}
	}
}
