const base = async (ctx) => {
	if (ctx.privilege <= 6) {
		return
	}
	const id = ctx.update.message.reply_to_message.from.id || ctx.update.message.reply_to_message.forward_from.id
	const play = await ctx.database.getUser(id)
	if (play && id) {
		let user = {
			from: {
				id: id
			},
			db: play
		}
		user.db.old = {...user.db}
		user.db.xp += 1200
		user.db.money += 5000
		user.db.inventory.push('11')
		ctx.replyWithHTML(`
<b>Thanks!</b>
+ 1200 XP
+ 5000 Money
+ 1 Diamond
		`)
		await ctx.database.saveUser(user)
		return
	}
	return
}

module.exports = {
	id: 'add',
	plugin: base,
	regex: [
		/^\/thanks/i
	]
}
