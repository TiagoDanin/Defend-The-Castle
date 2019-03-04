module.exports = {
	plugins: [
		'backup',
		'battles',
		'city',
		'config',
		'fight',
		'invite',
		'menu',
		'ping',
		'presents',
		'quests',
		'singup',
		'stats',
		'storevip',
		'thanks',
		'tutorial',
		'view'
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
	},
	ids: {
		log: -1001089887511,
		admins: [89198119, 61029284],
		mods: [91116586],
		groups: [-1001329027241, -1001401797636, -1001089887511]
	}
}
