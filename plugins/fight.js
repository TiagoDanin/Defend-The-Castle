const mapHide = (ctx, opponent) => {
	return opponent.city.reduce((total, id, index) => {
		var key = {}
		if (index == 12) {
			key = {
				text: ctx.castles[id],
				callback_data: 'fight:castle'
			}
		} else {
			key = {
				text: '🏠',
				callback_data: `fight:ack:${index}:${opponent.id}`
			}
		}
		total[total.length - 1].push(key)
		if (total[total.length - 1].length >= 5 && !(index >= opponent.city.length-1)) {
			total.push([])
		}
		return total
	}, [[]])
}

const showMap = (ctx, opponent, h, v) => {
	var items = []
	var index = 0
	var map = mapHide(ctx, opponent)
	map[2][2] = {
		text: '🏠',
		callback_data: 'fight:done'
	}
	map = map.reduce((totalV, keys, indexV) => {
		totalV = [...totalV, [...(
			keys.reduce((totalH, key, indexH) => {
				if (indexV == v || indexV-1 == v || indexV+1 == v) {
					if (indexH == h || indexH-1 == h || indexH+1 == h) {
						items.push(ctx.items[opponent.city[index]])
						key.text = ctx.items[opponent.city[index]].icon
					}
				}
				index++
				key.callback_data = 'fight:done'
				totalH.push(key)
				return totalH
			}, [])
		)]]
		return totalV
	}, [])
	map[2][2].text = ctx.castles[opponent.city[12]]
	return {
		map: map,
		items: items
	}
}

const base = async (ctx) => {
	var opponent = await ctx.database.randomUser()
	opponent = opponent[0]
	var text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
👮<b>‍♀️ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------vs--------------------
<b>${ctx.castles[Number(opponent.city[12])]} City:</b> ${opponent.name}
<b>🏅 Level:</b> ${opponent.level}
<b>🎖 Experience:</b> ${opponent.xp}
<b>💰 Money:</b> ${opponent.money}
	`

	var map = []
	if (ctx.match[2] == 'ack' && ctx.match[3] && ctx.match[4]) {
		const v = Math.floor((Number(ctx.match[3]))/5)
		const h = (Number(ctx.match[3])) % 5
		const data = showMap(ctx, opponent, h, v)
		//TODO batle
		map = data.map
	} else {
		map = mapHide(ctx, opponent)
	}

	var keyboard = [
		...map,
		[{text: '⚔️ Next' , callback_data: 'fight' }],
		[{text: '📜 Menu' , callback_data: 'menu' }]
	]

	return ctx.editMessageText(text, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

module.exports = {
	id: 'fight',
	callback: base,
	onlyUser: true
}
