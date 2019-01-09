module.exports = {
	plugins: [
		//'box',
		'city',
		//'fight',
		//'invite',
		'menu',
		'singup'
	],
	maxlevel: 10,
	defaultLang: 'en',
	locales: [],
	castles: ['🕌', '⛪️', '🏛', '🏩', '🏢', '🕍', '🏰'],
	items: {
		'0': {
			icon: '🚧',
			name: 'Null',
			city: true,
			battle: true
		},
		'1': {
			icon: '💣',
			name: 'Bomb',
			city: true
		},
		'2': {
			icon: '🛡',
			name: 'Supreme Shield',
			battle: true,
			sell: true
		},
		'3': {
			icon: '🏦',
			name: 'Bank',
			city: true
		},
		'4': {
			icon: '🗿',
			name: 'Tower Defense',
			city: true
		},
		'5': {
			icon: '🏨',
			name: 'Hospital',
			city: true
		},
		'6': {
			icon: '👽',
			name: 'Clone',
			epic: true,
			sell: true,
			city: true
		},
		'7': {
			icon: '💎',
			name: 'Diamond',
			epic: true,
			sell: true
		},
		'8': {
			icon: '⚔️',
			name: 'Zone War',
			city: true
		},
		'9': {
			icon: '🛡',
			name: 'Zone Defense',
			city: true
		},
		'10': {
			icon: '🚀',
			name: 'Rocket',
			city: true
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
