const base = async ctx => {
	let text = ctx._`<b>Select:</b>`
	const keyboard = [[]]

	Object.keys(ctx.classes).map(key => {
		const cl = ctx.classes[key]
		keyboard[0].push({
			text: ctx._(cl.name),
			callback_data: `class:${cl.id}`
		})
	})

	if (ctx.match[2] && ctx.classes[ctx.match[2]]) {
		const cl = ctx.classes[ctx.match[2]]
		const name = ctx._(cl.name)
		const desc = ctx._(cl.desc)
		if (ctx.match[3]) {
			text = ctx._`New class: ${name}`
			ctx.db.type = cl.id
			await ctx.database.updateUser(ctx.from.id, 'type', ctx.db.type)
		} else {
			text = `<b>${name}</b>\n${desc}\n`

			if (cl.attack > 0) {
				text += ctx._`<b>• ⚔️ Attack:</b> +${cl.attack}%\n`
			}

			if (cl.shield > 0) {
				text += ctx._`<b>• 🛡 Shield:</b> +${cl.shield}%\n`
			}

			if (cl.life > 0) {
				text += ctx._`<b>• ❤️ Life:</b> +${cl.life}%\n`
			}

			if (cl.money > 0) {
				text += ctx._`<b>• 💰 Money:</b> +${cl.money}%\n`
			}

			if (cl.xp > 0) {
				text += ctx._`<b>• 🎖 Experience:</b> +${cl.xp}%\n`
			}

			if (ctx.db.type != cl.id) {
				keyboard.push([
					{text: ctx._`✅ Select this class`, callback_data: `class:${cl.id}:ok`}
				])
			}
		}
	}

	keyboard.push([{
		text: ctx._`📜 Menu`,
		callback_data: 'menu:main'
	}])

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
	})
}

module.exports = {
	id: 'class',
	callback: base
}
