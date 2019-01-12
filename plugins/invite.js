const text = 'What\'s the name of your town?'
const base = async (ctx) => {
	ctx.replyWithMarkdown(`*${text}*`, {
		reply_markup: {
			force_reply: true
		}
	})
	const inviteId = Number(ctx.match[1])
	const res = await ctx.database.joinUserInvite(ctx.from.id, inviteId)
	console.log(res)
	const play = await ctx.database.getUser(inviteId)
	if (res && play && inviteId != ctx.from.id) {
		console.log('------')
		let user = {
			from: {
				id: inviteId
			},
			db: play
		}
		console.log(user)
		user.db.old = {...user.db}
		user.db.xp += 100
		user.db.money += 1000
		user.db.inventory.push('7')
		console.log(user)
		await ctx.database.saveUser(user)
		await ctx.telegram.sendMessage(user.db.id, `
<b>Join ${ctx.from.id} via your invite link.</b>
+ 100 XP
+ 1000 Money
+ 1 Diamond
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
