module.exports = {
	'5': {
		icon: '🏦',
		name: 'Bank',
		city: true,
		desc: 'Generate money for the castle.',
		doDb: (data) => {
			var banks = data.city.filter((e) => e == 5).length
			data.moneyPerHour = Math.floor(
				Math.pow(
					50,
					Math.pow(data.qt_bank, 0.092)
				) * banks
			)
			return data
		},
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				'Found money!',
				'MONEEEEY!',
				'💶💰'
			])
			let moreMoney = Math.floor(
				Math.pow(
					50,
					Math.pow(data.qt_bank, 0.092)
				) * 22 / 3.2
			)
			if (moreMoney > data.money) {
				moreMoney = data.money / 3
			}
			ctx.db.money += moreMoney
			ctx.db.money = Math.floor(ctx.db.money)
			return data
		},
		doTime: (data) => {
			const moneyPerSecond = (data.moneyPerHour / 60) / 60
			data.money += (data.timerunning * moneyPerSecond)
			return data
		},
		upgrade: [100, 0.087, 'bank']
	}
}
