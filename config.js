module.exports = {
	plugins: [
		//'box',
		//'city',
		//'fight',
		//'invite',
		'menu',
		'singup'
	],
	maxlevel: 10,
	defaultLang: 'en',
	locales: [],
	castles: {
		'1': {
			icon: '🕌'
		},
		'2': {
			icon: '⛪️'
		},
		'3': {
			icon: '🏛'
		},
		'4': {
			icon: '💒'
		}
	},
	items: {
		'1': {
			name: 'Bomb',
			city: true
		},
		'2': {
			name: 'Supreme Shield',
			battle: true,
			sell: true
		},
		'3': {
			name: 'Bank',
			city: true
		},
		'4': {
			name: 'Tower Defense',
			city: true
		},
		'5': {
			name: 'Hospital',
			city: true
		},
		'6': {
			name: 'Clone',
			epic: true,
			sell: true,
			city: true
		},
		'7': {
			name: 'Diamond',
			epic: true,
			sell: true
		}
	},
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
