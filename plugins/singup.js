const text = 'What\'s the name of your town?'
const callback = async (ctx) => {
	console.log(ctx)
	if (ctx.match[2] == 'yes') {
		//TODO Salve name and id in DB
		return ctx.reply('💾 Saved Name', {
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
		//TODO Valid name
		ctx.database.setUser(ctx.from.id, ctx.match[1], 'warrior')
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
