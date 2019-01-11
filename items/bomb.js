module.exports = {
	'1': {
		icon: '💣',
		name: 'Bomb',
		city: true,
		desc: 'Causa um grande dano a quem pisa nela e pode até acapa com toda a tropa inimiga.',
		doDefend: (data, ctx) => {
			const pos = Number(ctx.match[3])
			if (data.city[pos] == '1') {
				ctx.db.log.push([
					'Recruta pisou na mina!',
					'Nossas escolharas não foram boas.',
					'Eu avisei para você não ir...',
					'Estamos praticamente desimados.'
				])
				data.atack = ctx.db.atack / 3
				data.shield = (data.shield / 2) + (ctx.db.shield / 3)
			} else {
				ctx.db.log([
					'Esse foi por pouco.',
					'Agora só temos a sorte!'
				])
			}
			data.atack = data.atack * Math.floor(Math.pow(100, Math.pow(data.qt_bomb, 0.16)))
		},
		upgrade: [210, 0.2]
	}
}
