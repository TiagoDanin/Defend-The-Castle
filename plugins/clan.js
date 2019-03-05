const reply = async (ctx) => {
	if (ctx.session.newclan) {
		let match = ctx.match[1].match(/^([a-zA-Z]{3})-([a-zA-Z0-9-]{1,15})$/)
		if (match) {
			ctx.session.newclan.flag = match[1]
			ctx.session.newclan.name = match[2]
			await ctx.database.createClan(ctx.session.newclan)
			ctx.session.newclan = 'done'
			return ctx.replyWithMarkdown('*Done!*', {
				reply_markup: {
					inline_keyboard: [
						[
							{text: 'Open Clan' , callback_data: 'clan'}
						]
					]
				}
			})
		} else {
			return ctx.replyWithMarkdown('*NOTE:* Flag{3}-Name{1,15}; examle: `TNT-TNTClan`', {
				reply_markup: {
					force_reply: true
				}
			})
		}
	}
}

const base = async (ctx) => {
	let clan = await ctx.database.getClan(ctx.from.id)
	let text = '.'
	let keyboard = [
		[
			{text: 'Menu' , callback_data: 'menu'}
		]
	]

	if (!clan) {
		text = `Join or create a new clan!`
		keyboard = [
			[
				{text: 'Create' , callback_data: 'clan:new'},
				{text: 'List Clans' , callback_data: 'clan:list'}
			]
		]
	} else {
		text = `
<b>Name:</b> ${clan.name}
<b>Level:</b> ${clan.level}
<b>Xp:</b> ${ctx.nl(clan.xp)}
<b>Money:</b> ${ctx.nl(clan.money)}
<b>Members:</b> ${clan.members.length}
		`
	}

	if (ctx.match[2] == 'new') {
		ctx.session.newclan = {
			id: ctx.from.id,
			name: '',
			flag: '',
			members: [ctx.from.id]
		}
		text = `
Name and Flag (reply):
NOTE: Flag{3_length}-Name{1,15_length}
EXAMPLE: TNT-TNTClan
		`
		return ctx.replyWithHTML(text + ctx.fixKeyboard, {
			reply_markup: {
				force_reply: true
			},
			disable_web_page_preview: true
		})
	} else if (ctx.match[2] == 'list') {

	} else if (ctx.match[2] == 'exit') {
		clan.members = clan.members.filter(e => e != ctx.from.id)
		ctx.database.updateClan({
			id: clan.id,
			members: clan.members
		})
		text = 'Exited!'
		keyboard = [
			[
				{text: 'Create' , callback_data: 'clan:new'},
				{text: 'List Clans' , callback_data: 'clan:list'}
			]
		]
	}

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
	})
}

module.exports = {
	id: 'clan',
	callback: base,
	reply: reply
}
