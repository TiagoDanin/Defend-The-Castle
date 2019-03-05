const processClan = async (ctx, clan) => {
	const moneyPerSecond = (ctx.clan[clan.level].money / 60) / 60
	if (clan.timerunning >= 120) {
		clan.money += (clan.timerunning * moneyPerSecond)
		await ctx.database.updateClan({
			id: clan.id,
			money: clan.money
		})
	}
	return clan
}

const processView = (ctx, clan) => {
	return `
<b>🌇 Name:</b> ${clan.name} [${clan.flag}]
<b>🏅 Level:</b> ${clan.level}
<b>🎖 Experience:</b> ${ctx.nl(clan.xp)}
<b>💰 Money:</b> ${ctx.nl(clan.money)} (${ctx.nl(ctx.clan[clan.level].money)}/hour)
<b>👥 Members:</b> ${clan.members.length}/${ctx.clan[clan.level].members}`
}

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
							{text: '🌇 Open Clan' , callback_data: 'clan'}
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
			{text: '💰 Get Money' , callback_data: 'clan:money'},
			{text: '✨ Donate Experience' , callback_data: 'clan:xp'},
			{text: '👥 Members' , callback_data: 'clan:members'},
		],
		[
			{text: '🌇 Clan Menu' , callback_data: 'clan'},
			{text: '📜 Main Menu' , callback_data: 'menu'}
		]
	]

	if (!clan) {
		text = `Join or create a new clan!`
		keyboard = [
			[
				{text: '✏️ Create' , callback_data: 'clan:new'},
				{text: '📝 List Clans' , callback_data: 'clan:list'}
			]
		]
	} else {
		clan = await processClan(ctx, clan)
		text = processView(ctx, clan)
	}

	if (ctx.match[2] == 'members') {
		text = '<b>Members (wins;losses):\n</b>'
		for (let i = 0; i < clan.members.length; i++) {
			let member = clan.members[i]
			if (ctx.cache[member]) {
				member = ctx.cache[member]
			} else {
				let user = await ctx.database.getUser(member)
				ctx.cache[member] = {
					id: user.id,
					name: user.name,
					castle: ctx.castles[Number(user.city[12])],
					battles: 0,
					win: 0,
					lost: 0
				}
				member = ctx.cache[member]
			}
			text += `<b>${i+1}.</b>${member.castle} ${member.name} (+${member.win};-${member.lost})\n`
		}
	} else if (ctx.match[2] == 'new') {
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
		text = '<b>Clans:\n</b>'
		keyboard = [
			[
				//1-6 pad
			],
			[
				{text: '📜 Menu' , callback_data: 'menu'},
				{text: '🌇 More Clans' , callback_data: 'clan:list'}
			]
		]
		let clans = await ctx.database.getClans()
		for (let i = 0; i < (clans.length > 6 ? 6 : clans.length); i++) {
			clan = clans[i]
			text += `<b>${i+1}.</b>${clan.name} [${clan.flag}] (${clan.members.length}/${ctx.clan[clan.level].members})\n`
			keyboard[0].push({text: `${i+1}`, callback_data: `clan:join:${clan.id}`})
		}
		text += 'Join:'
	} else if (ctx.match[2] == 'join') {
		if (clan) {
			return ctx.replyWithMarkdown('You already have a clan!')
		}
		clan = await ctx.database.getClan(Number(ctx.match[3]))
		if (clan.members.length >= ctx.clan[clan.level].members) {
			return ctx.replyWithMarkdown(`Clan is full! (${clan.members.length}/${ctx.clan[clan.level].members})`)
		}
		clan.members.push(ctx.from.id)
		ctx.database.updateClan({
			id: clan.id,
			members: clan.members
		})
		text = 'Welcome!\n' + processView(ctx, clan)
		keyboard = [
			[
				{text: '🌇 Open Clan' , callback_data: 'clan'}
			]
		]
	} else if (ctx.match[2] == 'exit') {
		if (ctx.from.id == clan.id) {
			return replyWithMarkdown('*Owner cannot leave!*')
		}
		clan.members = clan.members.filter(e => e != ctx.from.id)
		ctx.database.updateClan({
			id: clan.id,
			members: clan.members
		})
		text = 'Leaving!'
		keyboard = [
			[
				{text: '✏️ Create' , callback_data: 'clan:new'},
				{text: '📝 List Clans' , callback_data: 'clan:list'}
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
