module.exports = {
	1: {
		icon: '💣',
		name: 'Bomb',
		city: true,
		desc: 'Great damage! Perfect trap for enemy troop. But the shields can suffer damage.',
		doDefend: (data, ctx) => {
			const qt = data.city.filter((id, index) => id == '1' && index != 12).length
			const pos = Number(ctx.match[3])
			if (data.city[pos] == '1') {
				ctx.db.log.push([
					ctx._`💣 Recruit stepped on the mine!`,
					ctx._`💣 Our choices were not good.`,
					ctx._`💣 We're practically decimated.`
				])
				data.attack += Math.floor(100 * (data.qt_bomb / qt))
				data.shield = (data.shield / 2) + (ctx.db.shield / 3)
			} else {
				ctx.db.log.push([
					ctx._`💣 We're lucky.`,
					ctx._`💣 There's a bomb with problems`
				])
				data.attack += ctx.db.attack / 12
			}

			return data
		},
		upgrade: [350, 'bomb']
	}
}
