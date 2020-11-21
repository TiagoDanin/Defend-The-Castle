const citys = [
	[
		5,
		0,
		0,
		0,
		4,
		0,
		1,
		0,
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		4,
		0,
		0,
		0,
		5
	], [
		0,
		0,
		0,
		0,
		4,
		0,
		1,
		0,
		3,
		0,
		0,
		5,
		1,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		4,
		0,
		5,
		0
	], [
		4,
		0,
		0,
		0,
		5,
		0,
		1,
		0,
		3,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		5,
		0,
		0,
		0,
		4
	], [
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		3,
		5,
		0,
		4,
		3,
		0,
		0,
		5,
		0,
		2,
		4,
		0,
		0,
		0,
		0,
		0,
		0
	], [
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0,
		3,
		0,
		0,
		0,
		4,
		5,
		0,
		0,
		0,
		2,
		5,
		0,
		4,
		0,
		0,
		0,
		1
	], [
		0,
		0,
		0,
		0,
		0,
		0,
		4,
		0,
		3,
		0,
		0,
		0,
		5,
		5,
		0,
		0,
		4,
		2,
		5,
		0,
		0,
		0,
		0,
		0,
		1
	], [
		5,
		0,
		0,
		0,
		0,
		0,
		4,
		0,
		3,
		0,
		0,
		4,
		6,
		0,
		0,
		5,
		0,
		2,
		1,
		0,
		0,
		0,
		0,
		0,
		0
	]
]

const callback = async ctx => {
	const text = ctx._`What's the name of your town?`
	if (ctx.match[2] == 'yes') {
		// TODO Select Class
		return ctx.reply(ctx._`💾 Saved` + ctx.fixKeyboard, {
			reply_markup: {
				inline_keyboard:
				[
					[{text: ctx._`❓ Tutorial`, callback_data: 'tutorial'}],
					[{text: ctx._`✅ Let's Go!`, callback_data: 'menu:main'}]
				]
			}
		})
	}

	return ctx.replyWithMarkdown(`*${text}*`, {
		reply_markup: {
			force_reply: true
		}
	})
}

const reply = async ctx => {
	const text = ctx._`What's the name of your town?`
	if (ctx.config.ids.groups.includes(ctx.chat.id)) {
		return true
	}

	if (ctx.match[0].match(text)) {
		console.log('ss')
		if (!ctx.match[1].match(/^([a-zA-Z\d-]{1,12})$/)) {
			return ctx.replyWithMarkdown(ctx._`
*Name must have only letter and number with a maximum of 12 characters!*
${text}
			`, {
				reply_markup: {
					force_reply: true
				}
			})
		}

		const db = await ctx.database.setUser(ctx.from.id, ctx.match[1])
		if (!db) {
			await ctx.database.updateUser(ctx.from.id, 'name', ctx.match[1])
		} else {
			const city = citys[Math.floor((Math.random() * citys.length))]
			ctx.database.updateUser(ctx.from.id, 'city', city)
		}

		return ctx.reply(ctx._`Are you sure the name of your city is ${ctx.match[1]}?.${ctx.fixKeyboard}`, {
			reply_markup: {
				inline_keyboard:
				[
					[{text: ctx._`✅ Yes`, callback_data: 'singup:yes'}],
					[{text: ctx._`❌ No`, callback_data: 'singup:no'}]
				]
			}
		})
	}

	if (!ctx.session.newclan) {
		return ctx.replyWithHTML(ctx._`Use the <code>/start</code>` + ctx.fixKeyboard, {
			reply_markup: {
				inline_keyboard:
				[
					[{text: ctx._`Or Click Here (Menu)`, callback_data: 'menu:main'}]
				]
			}
		})
	}
}

module.exports = {
	id: 'singup',
	callback,
	reply
}
