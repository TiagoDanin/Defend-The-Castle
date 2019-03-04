module.exports = {
	'5': {
		icon: '🏦',
		name: 'Bank',
		city: true,
		desc: 'Generate money for the castle.',
		battle: false,
		price: 300,
		qt: 1,
		doDb: (data, item) => {
			if (item.isInventory) return data
			data.moneyPerHour += Math.floor(85 * data.qt_bank)
			return data
		},
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				'🏦 Found money!',
				'🏦 MONEEEEY!',
				'🏦 💰'
			])
			let moreMoney = Math.floor(
				(60 * data.qt_bank) / 4.2
			)
			if (moreMoney > data.money) {
				moreMoney = data.money / 3
			}
			ctx.db.money += moreMoney
			ctx.db.money = Math.floor(ctx.db.money)
			return data
		},
		doTime: (data, item) => {
			if (item.isInventory) return data
			const moneyPerSecond = (data.moneyPerHour / 60) / 60
			data.money += (data.timerunning * moneyPerSecond)
			return data
		},
		upgrade: [340, 'bank']
	}
}
