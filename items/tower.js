module.exports = {
	'6': {
		icon: '🗿',
		name: 'Tower Defense',
		city: true,
		desc: '',
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 1)) == 0) {
				ctx.db.log.push([
					'... ?'
				])
				ctx.db.log.push([
					'Trap....',
					'Oh! No... Trap..'
				])
				data.attack += Math.floor(
					Math.pow(100, Math.pow(data.qt_towerdefense, 0.08)) / 1.3
				)
			} else {
				ctx.db.log.push([
					'The defense is down!'
				])
				data.shield += Math.floor(
					Math.pow(100, Math.pow(data.qt_towerdefense, 0.08)) / 1.3
				)
			}
			return data
		},
		upgrade: [160, 0.18, 'towerdefense']
	}
}
