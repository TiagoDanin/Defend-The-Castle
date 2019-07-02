const stringify = require('json-stringify-safe')

const base = async ctx => {
	if (ctx.privilege <= 6) {
		return
	}

	ctx.telegram.sendMessage(ctx.config.ids.log, '#Backup')
	ctx.telegram.sendDocument(
		ctx.config.ids.log,
		{
			filename: 'Users.backup.JSON',
			source: Buffer.from(stringify(
				await ctx.database.findAllTable('users')
			), 'utf8')
		}
	)
	ctx.telegram.sendDocument(
		ctx.config.ids.log,
		{
			filename: 'Stats.backup.JSON',
			source: Buffer.from(stringify(
				await ctx.database.findAllTable('stats')
			), 'utf8')
		}
	)
	ctx.telegram.sendDocument(
		ctx.config.ids.log,
		{
			filename: 'Clans.backup.JSON',
			source: Buffer.from(stringify(
				await ctx.database.findAllTable('clans')
			), 'utf8')
		}
	)
	ctx.telegram.sendDocument(
		ctx.config.ids.log,
		{
			filename: 'Cache.backup.JSON',
			source: Buffer.from(stringify(
				ctx.caches
			), 'utf8')
		}
	)
}

module.exports = {
	id: 'backup',
	plugin: base,
	regex: [
		/^\/backup/i
	]
}
