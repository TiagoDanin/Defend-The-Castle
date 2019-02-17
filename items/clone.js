module.exports = {
	'10': {
		icon: '👽',
		name: 'Clone',
		desc: '2x Attack, Shield and Life & +350xp',
		city: false,
		battle: true,
		price: 1,
		qt: 3,
		summon: (data) => {
			data.xp += 350
			data.attack += data.attack
			data.shield += data.shield
			data.life += data.life
			return data
		}
	}
}
