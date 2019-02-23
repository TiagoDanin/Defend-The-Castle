const base = async (ctx) => {
	let text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💎 Diamonds:</b> ${ctx.db.diamond}
${ctx.tips(ctx)}`

	const itemsIds = Object.keys(ctx.items).filter((id) => {
		if (ctx.items[id].qt) return true
		return false
	})
	let items = {}
	itemsIds.forEach((id) => {
		items[id] = ctx.items[id]
	})

	if (ctx.match[2]) {
		let item = {...items[ctx.match[2]]}
		if (ctx.match[3] == 'up') {
			if (ctx.db.diamond - item.price >= 0) {
				ctx.db.diamond = ctx.db.diamond - item.price
				ctx.db.inventory = ctx.db.inventory.reduce((total, id, index) => {
					if (id == 11 && item.price > 0) {
						item.price--
					} else {
						total.push(id)
					}
					return total
				}, [])
				ctx.db.inventory.push(ctx.match[2])
				await ctx.database.updateUser(ctx.from.id, 'inventory', ctx.db.inventory)
				ctx.answerCbQuery('Inventory update!')
			} else {
				ctx.answerCbQuery(`💎 Your diamonds: ${ctx.db.diamond} | Price: ${item.price}`, true)
				text += '\nFailed!'
			}
		}
		text = `
<b>${ctx.db.castle} City:</b> ${ctx.db.name}
<b>💎 Diamonds:</b> ${ctx.db.diamond}
${ctx.tips(ctx)}
---------------------------------------
<b>${item.icon} ${item.name}</b>
${item.desc}
<b>💎 Price:</b> ${items[ctx.match[2]].price}
			`
	}

	const mainKeyboard = itemsIds.reduce((total, id, index) => {
		let qt = ctx.db.inventory.filter(i => i == id).length || 0
		total.push([{
			text: `${items[id.toString()].icon} ${items[id.toString()].name} (${qt})`,
			callback_data: `vip:${id}`
		}, {
			text: `💎 ${items[id.toString()].price}`,
			callback_data: `vip:${id}:up`
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
		},
		disable_web_page_preview: true
	})
}

module.exports = {
	id: 'vip',
	callback: base,
	onlyUser: true
}
