const text = 'What\'s the name of your town?'
const callback = async (ctx) => {
	if (ctx.match[2] == 'yes') {
		//TODO Select Class
		return ctx.reply('💾 Saved', {
			reply_markup: {
				inline_keyboard:
				[
					[{text: 'Let\'s Go!' , callback_data: 'menu:main' }],
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

const reply = async (ctx) => {
	if (ctx.match[0].match(text)) {
		if (!ctx.match[1].match(/^([a-zA-Z0-9-]{1,12})$/)) {
			return ctx.replyWithMarkdown(`
*Name must have only letter and number with a maximum of 12 characters!*
${text}
			`, {
				reply_markup: {
					force_reply: true
				}
			})
		}
		let db = await ctx.database.setUser(ctx.from.id, ctx.match[1])
		if (!db) {
			await ctx.database.updateUser(ctx.from.id, 'name', ctx.match[1])
		}
		return ctx.reply(`Are you sure the name of your city is ${ctx.match[1]}?.`, {
			reply_markup: {
				inline_keyboard:
				[
					[{text: '✅ Yes' , callback_data: 'singup:yes' }],
					[{text: '❌ No' , callback_data: 'singup:no' }]
				]
			}
		})
	}
	return ctx.reply('Use the `/start`', {
		reply_markup: {
			inline_keyboard:
			[
				[{text: 'Or Click Here (Menu)' , callback_data: 'menu:main' }],
			]
		}
	})
}

module.exports = {
	id: 'singup',
	callback,
	reply
}
