const base = async (ctx) => {
	let text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin (${ctx.db.moneyPerHour}/hour)
---------------------------------------
⚔️ ${ctx.db.attack}
🛡 ${ctx.db.shield}
❤️ ${ctx.db.life}
`

	let items = {
		'1': {
			icon: '⚔️',
			name: 'Attack',
			value: 'attack',
			upgrade: 0.09
		},
		'2': {
			icon: '🛡',
			name: 'Shield',
			value: 'shield',
			upgrade: 0.07
		},
		'3': {
			icon: '❤️',
			name: 'Life',
			value: 'life',
			upgrade: 0.057
		}
	}
	Object.keys(items).map((e) => {
		items[e].price = Math.floor(
			Math.pow(
				100,
				Math.pow(ctx.db[items[e].value]+10, items[e].upgrade)
			)
		)
	})

	if (ctx.match[2] && ctx.match[3] == 'up') {
		let item = items[ctx.match[2].toString()]
		if (item && ctx.db.money >= item.price) {
			ctx.db.money -= item.price
			ctx.db.money = Math.floor(ctx.db.money)
			ctx.db[item.value] = Math.floor(ctx.db[item.value] + 10)
			text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💰 Money:</b> ${ctx.db.money} Coin (${ctx.db.moneyPerHour}/hour)
---------------------------------------
⚔️ ${ctx.db.attack}
🛡 ${ctx.db.shield}
❤️ ${ctx.db.life}

Upgraded!`
			ctx.database.updateUser(ctx.from.id, item.value, ctx.db[item.value]).then((res) => {
				if (res) {
					ctx.database.updateUser(ctx.from.id, 'money', ctx.db.money)
				}
			})
			Object.keys(items).map((e) => {
				items[e].price = Math.floor(
					Math.pow(
						100,
						Math.pow(ctx.db[items[e].value]+10, items[e].upgrade)
					)
				)
			})
			ctx.answerCbQuery('Upgraded!')
		} else {
			ctx.answerCbQuery(`❌ Your money ${ctx.db.money} | Price ${item.price}`, true)
			text += '\nFalid!'
		}
	}

	const mainKeyboard = Object.keys(items).reduce((total, id, index) => {
		total.push([{
			text: `${items[id.toString()].icon} ${items[id.toString()].name}`,
			callback_data: `base:${id}`
		}, {
			text: `💶 ${items[id.toString()].price}`,
			callback_data: `base:${id}:up`
		}])
		return total
	}, [])
	const keyboard = [
		...mainKeyboard,
		[{
			text: '📜 Menu',
			callback_data: 'menu:main'
		}]
	]

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		}
	})
}

module.exports = {
	id: 'base',
	callback: base,
	onlyUser: true
}
