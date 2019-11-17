const config = require('../base/config')

const sortCaches = (key, caches) => {
	return Object.keys(caches).sort((a, b) => {
		return caches[b][key] - caches[a][key]
	}).filter(e => !config.ids.bots.map(c => Number(c)).includes(Number(caches[e].id))).map(e => caches[e])
}

module.exports = sortCaches
module.exports.online = caches => sortCaches('count', caches)
module.exports.wins = caches => sortCaches('wins', caches)
module.exports.losts = caches => sortCaches('losts', caches)
module.exports.battles = caches => sortCaches('battles', caches)
