const channel = () => 'Channel: @DefendTheCastle'
const group = () => 'Group: @DefendTheCastleEN'
const developer = () => 'Developer: @TiagoEDGE (Tiago Danin)'
const invite = (ctx) => {
	return `Invite your friends with this link to earn Money & Xp: https://telegram.me/DefendTheCastleBot?start=join-${ctx.from.id}`
}
const tellMe = () => 'Suggestions & Bugs! Tell me @TiagoEDGE'
const tutorial = () => 'Tutorial: /tutorial'
const offline = () => 'Offline for 7 days causes penalties to the castle!'
const attackTroops = () => 'Attack Troops are not used to defend the castle!'
const castles = () => '' //TODO

//const quests = () => `<a href="https://telegram.me/DefendTheCastleBot?start=16febID23137653">🔑</a>` //Quests 16 feb

module.exports = [
	//quests,
	channel,
	group,
	developer,
	invite,
	tellMe,
	tutorial,
	offline,
	attackTroops
]
