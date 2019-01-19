const stringify = require('json-stringify-safe')
const base = async (ctx) => {
	if (process.env.log_chat != ctx.from.id) {
		return
	}
	ctx.telegram.sendMessage(process.env.log_chat, '#Backup')
	ctx.telegram.sendDocument(
		process.env.log_chat,
		{
			filename: 'Users.backup.JSON',
			source: Buffer.from(stringify(
				await ctx.database.findAllTable('users')
			), 'utf8')
		}
	)
	ctx.telegram.sendDocument(
		process.env.log_chat,
		{
			filename: 'Stats.backup.JSON',
			source: Buffer.from(stringify(
				await ctx.database.findAllTable('stats')
			), 'utf8')
		}
	)
	return
}

module.exports = {
	id: 'backup',
	plugin: base,
	regex: [
		/^\/backup/i
	]
}
