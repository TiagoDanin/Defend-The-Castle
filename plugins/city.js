const city = (ctx) => {
	return ctx.db.city.reduce((total, id, index) => {
		var key = {}
		if (index == 12) {
			key = {
				text: ctx.castles[id] || 'X',
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
	return [
		...keys,
		[{
			text: '📜 City',
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
			text: '📜 City',
			callback_data: 'city'
		}]
	]
}

const base = async (ctx) => {
	var text = `
<b>🏰 City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin
---------------------------------------
`
	var mainKeyboard = []
	if (ctx.match[0] == 'city:castle') {
		mainKeyboard = showCastle(ctx)
		text += '<b>Select your new castle:</b>'
	} else if (ctx.match[2] == 'castle' && ctx.match[3]) {
		ctx.db = await ctx.database.setCity(ctx, 12, ctx.match[3].toString())
		mainKeyboard = city(ctx)
		text += '<b>New castle!</b>'
	} else if (ctx.match[2] == 'inv' && ctx.match[3]) {
		mainKeyboard = showInventory(ctx, Number(ctx.match[3]))
		text += '<b>Select:</b>'
	} else if (ctx.match[2] == 'set' && ctx.match[3] && ctx.match[4]) {
		let valid = await ctx.database.replaceInventory(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
		if (valid) {
			await ctx.database.setCity(ctx, Number(ctx.match[3]), Number(ctx.match[4]))
			ctx.db = await ctx.userInfo(ctx)
			text += ctx.items[ctx.match[4].toString()].desc
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
