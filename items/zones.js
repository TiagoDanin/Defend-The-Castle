module.exports = {
	'2': {
		icon: '⚔️',
		name: 'Zone War',
		city: true,
		desc: 'Solados vão proteger essa aréa até o último supiro de vida!',
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					'Tomamos a zona com falicidade!',
					'No final comseguimos obter a zona!'
				])
			} else {
				ctx.db.log.push([
					'Caimos em uma armadilha.',
					'Execito para bem preparado.'
				])
				data.atack = data.atack * Math.floor(Math.pow(100, Math.pow(data.qt_zonewar, 0.08)))
			}
		},
		upgrade: [120.60, 0.2, 'zonewar']
	},
	'3': {
		icon: '🛡',
		name: 'Zone Defense',
		city: true,
		desc: 'O avanço da tropa inimiga não serar pareo para esse grupo treinado em defensa.',
		doDefend: (data, ctx) => {
			if (Math.floor((Math.random() * 3)) == 0) {
				ctx.db.log.push([
					'Defesa da zona foi quebrada!',
					'Estamos conseguindo entra na cidade.'
				])
			} else {
				ctx.db.log.push('Defesa da zona parace muito fonte para nossas tropas!')
				data.shield = data.shield * Math.floor(Math.pow(80, Math.pow(data.qt_zonewar, 0.123)))
			}
		},
		upgrade: [120.60, 0.2, 'zonedefense']
	}
}
