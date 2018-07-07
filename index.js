const Command = require('command');
const GameState = require('tera-game-state');

module.exports = function HPpotter(dispatch) {
	const game = GameState(dispatch);
	const command = Command(dispatch);
	game.initialize('contract');

	let cooldown = false,
		enabled = true,
		playerLocation,
		playerAngle;
				
	dispatch.hook('S_START_COOLTIME_ITEM', 1, event => {		
		if(event.item == 6552) { // has 10 seconds cooldown
			cooldown = true;
			setTimeout(() => {
				cooldown = false;
			}, event.cooldown*1000);
		};
	});
	
	dispatch.hook('S_PLAYER_STAT_UPDATE', 9, event => {
		currentHp = event.hp.toNumber();
		maxHp = event.maxHp.toNumber();
		
		if(!cooldown && (currentHp <= maxHp/3)) {
			//command.message('trying to use item');
			useItem();

		};
	});

	dispatch.hook('C_PLAYER_LOCATION', 5, event => {
		playerLocation = event.loc;
		playerAngle = event.w;
	});
	
	function useItem() {
		if (!enabled) return;
		if(game.me.alive && game.me.inCombat && !game.me.mounted && !game.contract.active && !game.me.inBattleground) {
			//command.message('using pot.')
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: game.me.gameId,
				id: 6552, // 6562: Prime Replenishment Potable, 184659: Everful Nostrum
				dbid: 0,
				target: 0,
				amount: 1,
				dest: 0,
				loc: playerLocation,
				w: playerAngle,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: true
			});
		};
	};


	command.add('hppot', () => {
		if(enabled) {
			enabled = false;
			command.message('HP-potter disabled.');
		};
		else if(!enabled) {
			enabled = true;
			command.message('HP-potter Enabled.');
		};
		else{
			command.message('Invalid Command.');
		};
	});
	this.destructor = () => { command.remove('hppot') };
};