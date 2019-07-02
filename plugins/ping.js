const moment = require('moment-timezone')

const base = async ctx => {
	const tgDate = moment(ctx.message.date).tz('America/Los_Angeles')
	const serverDate = moment((new Date()).getTime() / 1000).tz('America/Los_Angeles')
	return ctx.replyWithMarkdown(`
*Pong 🎾*
*ServerTg:* ${tgDate.format('hh:mm:ss:SSSS')}
*ServerBot:* ${serverDate.format('hh:mm:ss:SSSS')}
	`)
}

module.exports = {
	id: 'ping',
	plugin: base,
	regex: [
		/^\/ping/i
	]
}
