const base = async (ctx) => {
	if (process.env.log_chat != ctx.from.id) {
		return
	}

	const id = ctx.message.reply_to_message.from.id
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
		user.db.inventory.push('7')
		await ctx.database.saveUser(user)
		return ctx.replyWithHTML(`
<b>Thanks!</b>
+ 1200 XP
+ 5000 Money
+ 1 Diamond
		`)
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
