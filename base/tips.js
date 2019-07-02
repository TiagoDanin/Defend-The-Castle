const channel = ctx => ctx._`Channel: @DefendTheCastle`
const group = ctx => ctx._`Groups: @DefendTheCastleEN (English) or @DefendTheCastlePT (Portuguese)`
const developer = ctx => ctx._`Developer: @TiagoEDGE (Tiago Danin)`
const invite = ctx => {
	return ctx._`Invite your friends with this link to earn Money & Xp: https://telegram.me/DefendTheCastleBot?start=join-${ctx.from.id}`
}

const tellMe = ctx => ctx._`Suggestions & Bugs! Tell me @TiagoEDGE (You can receive 💎 & 💰)`
const tutorial = ctx => ctx._`Tutorial: /tutorial`
const offline = ctx => ctx._`Offline for 7 days causes penalties to the castle!`
const clan = ctx => {
	return ctx._`Increasing the level of the clan, increases the number of members & more money per hour`
}

const storeVip = ctx => ctx._`Use 💎 in Store VIP`
const powerups = ctx => ctx._`Use powerups to earn more XP`
const presents = ctx => ctx._`Every 24 hours you can open a gift!`
const quests = ctx => {
	if (ctx.quest.select.id == 'key') {
		return ctx._`<a href="https://telegram.me/DefendTheCastleBot?start=quests-${ctx.quest.select.key}">🔑</a>`
	}

	return ctx._`Finish the quest to receive 💎 & 💰`
}

module.exports = [
	quests,
	channel,
	group,
	group,
	developer,
	developer,
	invite,
	tellMe,
	tellMe,
	tutorial,
	offline,
	storeVip,
	clan,
	powerups,
	quests,
	presents,
	channel,
	group,
	tellMe
]
