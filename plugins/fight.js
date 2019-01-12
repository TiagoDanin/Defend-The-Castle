const hack = (ctx) => {
	return ctx.answerCbQuery(':) Start a new game!', true)
}

const doAtack = (p1, p2) => {
	return p1.life - ((p2.attack / (p1.shield / 100)) / 1.2)
}

const atack = async (ctx, opponent) => {
	const playId = ctx.match[4]
	let play = await ctx.database.getUser(playId)
	let text = `<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
👮<b>‍♀️ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------vs--------------------
<b>${ctx.castles[Number(play.city[12])]} City:</b> ${play.name}
<b>🏅 Level:</b> ${play.level}
<b>🎖 Experience:</b> ${play.xp}
<b>💰 Money:</b> ${play.money}`

	if(ctx.db.opponent != play.id) {
		return hack(ctx)
	}

	const xps = {
		play: play.xp,
		user: ctx.db.xp
	}
	const v = Math.floor((Number(ctx.match[3]))/5)
	const h = (Number(ctx.match[3])) % 5
	const data = showMap(ctx, play, h, v)
	for (let item of data.items) {
		if (item.doDefend) {
			play = item.doDefend(play, ctx)
		}
	}
	for (let item of ctx.db.inventory) {
		if (item.doAtack) {
			ctx.db = item.doAtack(ctx.db)
		}
	}

	ctx.db.log = ctx.db.log.map((table) => {
		return table[Math.floor((Math.random() * table.length))]
	})

	ctx.db.attack = Math.floor(ctx.db.attack)
	ctx.db.shield = Math.floor(ctx.db.shield)
	ctx.db.life = Math.floor(ctx.db.life)

	play.attack = Math.floor(play.attack)
	play.shield = Math.floor(play.shield)
	play.life = Math.floor(play.life)

	text += `
---------------------------------------
${ctx.db.attack} ⚔️ ${play.attack}
${ctx.db.shield} 🛡 ${play.shield}
${ctx.db.life} ❤️ ${play.life}
---------------------------------------
<b>-</b>${ctx.db.log.join('\n<b>-</b>')}`
	ctx.db.life = Math.floor(doAtack(ctx.db, play))
	play.life = Math.floor(doAtack(play, ctx.db))

	//TODO XP with base level
	const xp = 100
	if (data.items.length <= 6) {
		text = `
${ctx.db.name} LOST!
<b>CASTLE WITHOUT DAMAGE</b>
---------------------------------------
${text}`
		play.xp += xp/15
	} else if (ctx.db.life > play.life) {
		ctx.db.xp += xp
		play.xp += xp/10
		text = `
${ctx.db.name} WIN!
---------------------------------------
${text}`
	} else {
		ctx.db.xp += xp/9
		play.xp += xp/4
		text = `
${ctx.db.name} LOST!
---------------------------------------
${text}`
	}

	ctx.db.money = Math.floor(ctx.db.money)
	ctx.db.xp = Math.floor(ctx.db.xp)
	play.xp = Math.floor(play.xp)

	const res = await ctx.database.saveAtack(play.id, play.xp, ctx, opponent)
	if (!res) {
		return hack(ctx)
	}

	map = data.map
	await ctx.editMessageText(text, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [...map, [
				{
					text: `✨XP ${ctx.db.xp - xps.user} : ⚖️ ${text.match('WIN') ? 'WIN!' : 'LOST!'}`,
					callback_data: 'fight:done'
				}
			]]
		}
	})
	return await ctx.telegram.sendMessage(play.id, `
<b>Reply attack of ${ctx.db.name} (${ctx.db.id}):</b>
${text}
`, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: [...map, [
				{
					text: `✨XP ${play.xp - xps.play}`,
					callback_data: 'fight:done'
				}
			]]
		}
	})
}

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
	let _new = false
	let opponent = await ctx.database.randomUser(1)
	opponent = opponent[0]
	let text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>🏅 Level:</b> ${ctx.db.level}
<b>🎖 Experience:</b> ${ctx.db.xp}
👮<b>‍♀️ Troops:</b> ${ctx.db.troops}/${ctx.db.maxTroops}
-------------------vs--------------------
<b>${ctx.castles[Number(opponent.city[12])]} City:</b> ${opponent.name}
<b>🏅 Level:</b> ${opponent.level}
<b>🎖 Experience:</b> ${opponent.xp}
<b>💰 Money:</b> ${opponent.money}`

	var map = []
	if (ctx.match[2] == 'done') {
		hack(ctx)
	} else if (ctx.match[2] == 'ack' && ctx.match[3] && ctx.match[4]) {
		await atack(ctx, opponent)
		_new = true
	}
	map = mapHide(ctx, opponent)

	var keyboard = [
		...map,
		[{text: '⚔️ Next' , callback_data: 'fight' }],
		[{text: '📜 Menu' , callback_data: 'menu' }]
	]

	if (_new) {
		return ctx.replyWithHTML(text, {
			reply_markup: {
				inline_keyboard: keyboard
			}
		})
	} else {
		await ctx.database.updateUser(ctx.from.id, 'opponent', opponent.id)
	}

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
