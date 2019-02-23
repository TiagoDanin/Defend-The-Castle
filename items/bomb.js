module.exports = {
	'1': {
		icon: '💣',
		name: 'Bomb',
		city: true,
		desc: 'Great damage! Perfect trap for enemy troop. But the shields can suffer damage.',
		doDefend: (data, ctx) => {
			const pos = Number(ctx.match[3])
			if (data.city[pos] == '1') {
				ctx.db.log.push([
					'💣 Recruit stepped on the mine!',
					'💣 Our choices were not good.',,
					'💣 We\'re practically disimated.'
				])
				data.attack += Math.floor(100 * data.qt_bomb)
				data.shield = (data.shield / 2) + (ctx.db.shield / 3)
			} else {
				ctx.db.log.push([
					'💣 We\'re lucky.',
					'💣 There\'s a bomb with problems'
				])
				data.attack += ctx.db.attack / 12
			}
			return data
		},
		upgrade: [350, 'bomb']
	}
}
