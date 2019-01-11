module.exports = {
	'4': {
		icon: '🚀',
		name: 'Rocket',
		city: true,
		desc: 'Tropa espicializada em derruba drones e aviões.',
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				'Nosso avião está caido!',
				'Acho que conseguimos escapa a tempo'
			])
			data.
			data.atack += Math.floor(Math.pow(100, Math.pow(data.qt_rocket, 0.16))) / (Math.floor((Math.random() * 3)) + 3)
		},
		upgrade: [800, 0.2, 'rocket']
	}
}
