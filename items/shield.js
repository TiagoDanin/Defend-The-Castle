module.exports = {
	'12': {
		icon: '🛡',
		name: 'Supreme Shield',
		desc: '3x +Shield & +150 Xp',
		city: false,
		battle: true,
		price: 1,
		qt: 5,
		summon: (data) => {
			data.xp += 150
			data.shield += data.shield * 2
			return data
		}
	}
}
