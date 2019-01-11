const base = async (ctx) => {
	const inviteId = Number(ctx.match[1])
	const res = await ctx.database.joinUserInvite(ctx.from.id, inviteId)
	if (res) { //&& inviteId != ctx.from.id) {
		console.log('------')
		let user = {
			from: {
				id: inviteId
			},
			db: await ctx.database.getUser(inviteId)
		}
		console.log(user)
		user.db.old = user.db
		user.db.xp += 100
		user.db.money += 1000
		user.db.inventory.push('7')
		connsole.log(user)
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
