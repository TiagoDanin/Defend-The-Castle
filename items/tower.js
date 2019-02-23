module.exports = {
	'6': {
		icon: '🗿',
		name: 'Tower Defense',
		city: true,
		desc: '',
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 2)) == 0) {
				ctx.db.log.push([
					'🗿 Trap....',
					'🗿 Oh! No... Trap..'
				])
				data.attack += Math.floor(60 * data.qt_towerdefense)
			} else {
				ctx.db.log.push([
					'🗿 The defense is down!'
				])
				data.shield += Math.floor(12 * data.qt_towerdefense)
			}
			return data
		},
		upgrade: [190, 'towerdefense']
	}
}
