module.exports = {
	'4': {
		icon: '🚀',
		name: 'Rocket',
		city: true,
		desc: 'Troop focused on knocking down drones and airplanes.',
		doDefend: (data, ctx) => {
			ctx.db.log.push([
				'Our airplane is down!',
				'I think we can escape in time.'
			])
			data.attack += Math.floor(Math.pow(100, Math.pow(data.qt_rocket, 0.16))) / (Math.floor((Math.random() * 3)) + 3)
			return data
		},
		upgrade: [690, 0.2, 'rocket']
	}
}
