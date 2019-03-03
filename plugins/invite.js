const text = 'What\'s the name of your town?'
const base = async (ctx) => {
	ctx.replyWithMarkdown(`*${text}*`, {
		reply_markup: {
			force_reply: true
		}
	})
	const inviteId = Number(ctx.match[1])
	const res = await ctx.database.joinUserInvite(ctx.from.id, inviteId)
	const play = await ctx.database.getUser(inviteId)
	if (res && play && inviteId != ctx.from.id) {
		let user = {
			from: {
				id: inviteId
			},
			db: play
		}
		user.db.old = {...user.db}
		user.db.xp += 1200
		user.db.money += 5500
		user.db.inventory.push('11')
		user.db.inventory.push('11')
		user.db.inventory.push('10')
		user.db.inventory.push('12')
		await ctx.database.saveUser(user)
		await ctx.telegram.sendMessage(user.db.id, `
<b>Join ${ctx.from.id} via your invite link.</b>
+ 1200 XP
+ 5500 Money
+ 2 Diamond
+ 1 Clone
+ 1 Super Shield
		`, {
			parse_mode: 'HTML'
		})
	}
	return
}

module.exports = {
	id: 'invite',
	plugin: base,
	regex: [
		/^\/join (\d+)/i
	]
}
