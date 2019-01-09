const city = (ctx) => {
	return ctx.db.city.reduce((total, id, index) => {
		var key = {}
		if (index == 12) {
			key = {
				text: ctx.castles[id],
				callback_data: 'city:castle'
			}
		} else {
			key = {
				text: ctx.items[id.toString()].icon,
				callback_data: `city:${index}:${id}` //pos:id
			}
		}
		total[total.length - 1].push(key)
		if (total[total.length - 1].length >= 5 && !(index >= ctx.db.city.length-1)) {
			total.push([])
		}
		return total
	}, [[]])
}

const showCastle = (ctx) => {
	return
}

const base = async (ctx) => {
	var text = `
<b>🏰 City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin
---------------------------------------`
	var mainKeyboard = []
	if (ctx.match[2] == 'castle') {
		mainKeyboard = showCastle(ctx)
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
