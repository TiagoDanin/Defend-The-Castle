module.exports = {
	plugins: [
		'base',
		'box',
		'city',
		'config',
		'fight',
		'invite',
		'menu',
		'singup',
		//'stats',
		'tutorial'
	],
	defaultLang: 'en',
	locales: [],
	castles: ['🕌', '⛪️', '🏛', '🏩', '🏢', '🕍', '🏰'],
	class: {
		warrior: {
			maxTroops: 8,
			plusAtack: 12,
			plusLife: 10,
			inventory: [2]
		},
		archer: {
			plusAtack: 10,
			maxTroops: 6,
			inventory: [1, 1] //Mina :^)
		},
		economist: {
			plusMoney: 20,
			startMoney: 1200,
			inventory: [2, 2] //Security :^)
		},
		adventurer: {
			plusMoney: 5,
			plusShield: 5,
			inventory: [1, 2]
		}
	}
}
