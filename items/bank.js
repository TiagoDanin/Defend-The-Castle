const price = (data) => {
	return {
		upgrade: Math.floor(Math.pow(100, Math.pow(data.qt_bank+1, 0.2)))
	}
}

module.exports = {
	'5': {
		icon: '🏦',
		name: 'Bank',
		city: true,
		desc: 'Generate money for the castle.',
		price: price,
		doDb: (data) => {
			var banks = data.city.filter((e) => e == 5).length
			data.moneyPerHour = Math.floor((Math.pow(100, Math.pow(data.qt_bank, 0.092)) * banks))
			return data
		},
		doTime: (data) => {
			var moneyPerSecond = (data.moneyPerHour / 60) / 60
			data.money = data.money + (data.timerunning * moneyPerSecond)
			return data
		},
		upgrade: [100, 0.2, 'bank']
	}
}
