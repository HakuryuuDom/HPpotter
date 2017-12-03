const Command = require('command')

module.exports = function HPpotter(dispatch) {
	
	 const command = Command(dispatch);
	
	let cid = null,
		player = '',
		cooldown = false,
		enabled,
		battleground,
		onmount,
		incontract,
		inbattleground,
		alive,
		inCombat
		
	// #############
	// ### Magic ###
	// #############
	
	dispatch.hook('S_LOGIN', 1, event => {
		({cid} = event)
		player = event.name
		enabled = true
	})
	
	dispatch.hook('S_START_COOLTIME_ITEM', 1, event => { 
		let item = event.item
		let thiscooldown = event.cooldown
		
		if(item == 6562) { // has 10 seconds cooldown
			cooldown = true
			setTimeout(() => {
				cooldown = false
			}, thiscooldown*1000)
		}
	})
	
	dispatch.hook('S_PLAYER_STAT_UPDATE', event => {
		hp = event.hp.toNumber()
		maxHp = event.maxHp.toNumber()
		
		if(!cooldown && (hp <= maxHp/3)) {
			useItem()
		}
	})
	
	function useItem() {
		if (!enabled) return
		if(alive && inCombat && !onmount && !incontract && !inbattleground) {
			dispatch.toServer('C_USE_ITEM', 1, {
				ownerId: cid,
				item: 6552, // 6552 = Prime Recovery Potable
				id: 0,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: 1,
				unk5: 0,
				unk6: 0,
				unk7: 0,
				x: 0, 
				y: 0, 
				z: 0, 
				w: 0, 
				unk8: 0,
				unk9: 0,
				unk10: 0,
				unk11: 1,
			})
		}
	}
	
	// ##############
	// ### Checks ###
	// ##############
	
	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { battleground = event.zone })
	dispatch.hook('S_LOAD_TOPO', 1, event => {
		onmount = false
		incontract = false
		inbattleground = event.zone == battleground
	})
	
	dispatch.hook('S_SPAWN_ME', 1, event => { 
		alive = event.alive
	})
	
	dispatch.hook('S_USER_STATUS', 1, event => { 
		if(event.target.equals(cid)) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
	
	dispatch.hook('S_CREATURE_LIFE', 1, event => {
		if(event.target.equals(cid) && (alive != event.alive)) {
			if(!alive) {
				onmount = false
				incontract = false
			}
		}
	})

	dispatch.hook('S_MOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = true })
	dispatch.hook('S_UNMOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = false })

	dispatch.hook('S_REQUEST_CONTRACT', 1, event => { incontract = true })
	dispatch.hook('S_ACCEPT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_REJECT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_CANCEL_CONTRACT', 1, event => { incontract = false })
	
	// #################
	// ### Chat Hook ###
	// #################
		
command.add('HPpotter', () => {
        enabled = !enabled;
        let txt = (enabled) ? 'ENABLED' : 'DISABLED';
        command.message('HPpotter is ' + txt, true);
    })
}