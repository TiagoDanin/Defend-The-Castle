const city = (ctx) => {
	return ctx.db.city.reduce((total, id, index) => {
		var key = {}
		if (index == 12) {
			key = {
				text: ctx.db.castle,
				callback_data: 'city:castle'
			}
		} else {
			key = {
				text: ctx.items[id.toString()].icon,
				callback_data: `city:inv:${index}`
			}
		}
		total[total.length - 1].push(key)
		if (total[total.length - 1].length >= 5 && !(index >= ctx.db.city.length-1)) {
			total.push([])
		}
		return total
	}, [[]])
}

const showInventory = (ctx, pos) => {
	let keys = ctx.db.inventory.reduce((total, id, index) => {
		if (ctx.items[id.toString()].city) {
			total[total.length - 1].push({
				text: ctx.items[id.toString()].icon,
				callback_data: `city:set:${pos}:${id}`
			})
			if (total[total.length - 1].length >= 3 && !(index >= ctx.db.inventory.length-1)) {
				total.push([])
			}
		}
		return total
	}, [[]])
	var upgrade = []
	if (ctx.items[ctx.db.city[pos.toString()].toString()].upgrade) {
		upgrade = [
			[{
				text: '✅ Upgrade (+1)',
				callback_data: `city:up:${pos}:1`
			},
			{
				text: '✅ Upgrade (Max)',
				callback_data: `city:up:${pos}:max`
			}]
		]
	}
	return [
		...upgrade,
		...keys,
		[{
			text: `${ctx.db.castle} City`,
			callback_data: 'city'
		}]
	]
}

const showCastle = (ctx) => {
	let keys = ctx.castles.reduce((total, icon, index) => {
		total[total.length - 1].push({
			text: icon,
			callback_data: `city:castle:${index}`
		})
		if (total[total.length - 1].length >= 3 && !(index >= ctx.castles.length-1)) {
			total.push([])
		}
		return total
	}, [[]])
	return [
		...keys,
		[{
			text: `${ctx.db.castle} City`,
			callback_data: 'city'
		}]
	]
}

const infoText = (ctx) => {
	var item = ctx.items[ctx.db.city[ctx.match[3].toString()].toString()]
	var info = `<b>${item.icon} ${item.name}</b>\n`
	info += item.desc
	if (item.upgrade) {
		info += `\n<b>💶 Upgrade:</b> ${item.price(ctx.db).upgrade} Coin`
	}
	return info
}

const base = async (ctx) => {
	var text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin (${ctx.db.moneyPerHour}/hour)
---------------------------------------
`
	var mainKeyboard = []
	if (ctx.match[0] == 'city:castle') {
		mainKeyboard = showCastle(ctx)
		text += '<b>Select your new castle:</b>'
	} else if (ctx.match[2] == 'castle' && ctx.match[3]) {
		ctx.db = await ctx.database.setCity(ctx, 12, ctx.match[3].toString())
		ctx.db.castle = ctx.castles[Number(ctx.match[3])] || '🏰'
		mainKeyboard = city(ctx)
		text = `
	<b>${ctx.db.castle} City:</b> ${ctx.db.name}
	<b>💰 Money:</b> ${ctx.db.money} Coin (${ctx.db.moneyPerHour}/hour)
	---------------------------------------
	<b>New castle!</b>
		`
	} else if (ctx.match[2] == 'up' && ctx.match[3]) {
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
		text += infoText(ctx)
		//TODO upgrade
	} else if (ctx.match[2] == 'inv' && ctx.match[3]) {
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
		text += infoText(ctx)
	} else if (ctx.match[2] == 'set' && ctx.match[3] && ctx.match[4]) {
		let valid = await ctx.database.replaceInventory(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
		if (valid) {
			await ctx.database.setCity(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
			ctx.db = await ctx.userInfo(ctx)
			text += infoText(ctx)
		} else {
			text += 'Hack?'
		}
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
	} else {
		mainKeyboard = city(ctx)
	}
	var keyboard = [
		...mainKeyboard,
		[{
			text: '📜 Menu',
			callback_data: 'menu:main'
		}]
	]

	return ctx.editMessageText(text, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

module.exports = {
	id: 'city',
	callback: base,
	onlyUser: true
}
