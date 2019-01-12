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
				data.attack += Math.floor(Math.pow(100, Math.pow(data.qt_towerdefense, 0.08)))
			} else {
				ctx.db.log.push([
					'The defense is down!'
				])
				data.shield += Math.floor(Math.pow(100, Math.pow(data.qt_towerdefense, 0.08)))
			}
			return data
		},
		upgrade: [130.60, 0.2, 'towerdefense']
	}
}
