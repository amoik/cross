var modal;
var modalCount = 0;

modal = modal || (function ()
{
	var pleaseWaitDiv = $('<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false"><div class="modal-body"></div></div>');
	return{
		showPleaseWait: function()
		{
			modalCount ++;
			pleaseWaitDiv.modal();
		},
		hidePleaseWait: function ()
		{
			modalCount --;

			if(modalCount <= 0)
			{
				modalCount = 0;
				pleaseWaitDiv.modal('hide');
			}
		},
	};
})();



var mpGame = angular.module('mpGame', []).controller('mpGameCtr', function($scope)
{
	modal.showPleaseWait();
	var mpg = this;
	mpg.title = "Multiplayer Game";
	mpg.interface = "none";
	mpg.running = false;
	mpg.WS_SERVER = "ws://192.168.1.20:1234";
	mpg.game ={name:"TODO"};
	mpg.games=[];


	angular.element(document).ready(function ()
	{
		modal.hidePleaseWait();
		var savedSocket = getConfig("lobby");
		if(savedSocket)
		{
			mpg.WS_SERVER = savedSocket;
			mpg.login();
		}
		else
		{
			mpg.setInterface("welcome");
		}
	});

	mpg.newGame = {name:"",maxCount:10};


	mpg.login = function()
	{

		wsConnect(
			mpg.WS_SERVER,
			function()
			{
				setConfig("lobby",mpg.WS_SERVER);
				mpg.readLobby();
				mpg.addAllWsListeners();
			},
			function()
			{
				mpg.setInterface("welcome");
			}
		);
	}

	mpg.readLobby = function()
	{
		modal.showPleaseWait();
		wsSend({request:"readLobby"});
	}

	mpg.createGame = function()
	{
		if(mpg.checkIfGameNameExists(mpg.newGame.name))
		{
			alrt("Der gewählte Name ist bereits vergeben!");
			return;
		}
		if(mpg.newGame.name == "")
		{
			alrt("Es wurde kein Name gewählt!");
			return;
		}

		modal.showPleaseWait();
		wsSend("createGame");
		mpg.readLobby();
	}
	mpg.logout = function()
	{
		setConfig("lobby",false);
		mpg.setInterface("welcome");
	}

	mpg.joinGame = function(game)
	{
		wsSend({request:"joinGame"});
	}

	mpg.checkIfGameNameExists = function(n)
	{
		for(var i = 0; i < mpg.games.length; i++)
		{
			if(n === mpg.games[i].name)
				return true;
		}
		return false;
	}



	mpg.addAllWsListeners = function()
	{
		wsAddListener
		(
			"joinGame",
			function(d)
			{
				modal.hidePleaseWait();
				mpg.game=d;
				alrt("joined!");
			}
		);

		wsAddListener
		(
			"readLobby",
			function(d)
			{
				modal.hidePleaseWait();
				mpg.games=d;
				mpg.setInterface("lobby");
			}
		);


		wsAddListener
		(
			"createGame",
			function(d)
			{
				modal.hidePleaseWait();
				mpg.joinGame(d);
			}
		);
	}
































	mpg.addFollowName = function(lvls)
	{
		for(var i = 0; i < lvls.length; i++)
		{
			if(lvls[i].follow == -1)
				continue;

			for(var j = 0; j < lvls.length; j++)
			{

				if(lvls[i].follow == lvls[j].id)
				{
					lvls[i].followName = lvls[j].name;
				}
			}
		}
	}

	mpg.findFollowByName = function(name)
	{
		for(var i = 0; i < mpg.levels.length; i++)
		{
			if(mpg.levels[i].name == name)
			{
				return mpg.levels[i].id;
			}
		}
		return -1;
	}

	mpg.saveTmp = function(lvl)
	{
		mpg.loadedLevel.details = lvl;
		//setConfig("loadedLevel", mpg.loadedLevel);
	}



	mpg.removeLevel = function(lvl)
	{
		AJAXCall({function:"deleteLevel",id:lvl.id},function(res){mpg.rebuildLevelTable();});
	}
	mpg.openLevel = function(lvl)
	{
		mpg.setInterface("detail");
		modal.showPleaseWait();
		AJAXCall({function:"getLevelDetails",id:lvl.id},function(res)
		{
			modal.hidePleaseWait();
			mpg.loadedLevel = lvl;
			mpg.loadedLevel.details = res;

			$scope.$apply();
			canvDraw(mpg.loadedLevel.details);
		});
	}



	mpg.saveLevel = function(lvl)
	{
		modal.showPleaseWait();
		var fId = -1;

		if(lvl.name.replace(/ /g,'') == "")
		{
			alert("Es muss ein Name angegeben werden!");
			modal.hidePleaseWait();
			return;
		}
		if(lvl.followName != undefined && lvl.followName.replace(/ /g,'') !== "")
		{
			var fId = mpg.findFollowByName(lvl.followName);
		}


		if(lvl.details)
		{
			AJAXCall({function:"saveLevelWithDetails",level:{id:lvl.id,version:lvl.version,name:lvl.name,follow:fId,details:lvl.details}},function(res)
			{
				modal.hidePleaseWait();
				mpg.rebuildLevelTable();
				mpg.newLevel.name = "";
				mpg.newLevel.follow = "";
			});
		}
		else
		{
			AJAXCall({function:"saveLevel",level:{id:lvl.id,version:lvl.version,name:lvl.name,follow:fId}},function(res)
			{
				modal.hidePleaseWait();
				mpg.rebuildLevelTable();
				mpg.newLevel.name = "";
				mpg.newLevel.follow = "";
			});

		}
	}

	mpg.removeOneBackground = function()
	{
		if(mpg.loadedLevel.details.backgrounds.length > 0)
			mpg.loadedLevel.details.backgrounds.pop();
	}
	mpg.addBackground = function(bg)
	{
		mpg.loadedLevel.details.backgrounds.push(bg.id);
	}

	mpg.addEntity = function(ent)
	{
		mpg.npc = ent;
	}

	mpg.removeChoosenEntity = function()
	{
		if(!mpg.npc.isNew)
		{
			var gd = mpg.loadedLevel.details.goodies;
			for(var i = 0; i < gd.length; i++)
				if(gd[i].choosen)
					gd.splice(i, 1);


			var en = mpg.loadedLevel.details.enemies;
			for(var i = 0; i < en.length; i++)
				if(en[i].choosen)
					en.splice(i, 1);
		}
		mpg.npc = false;
	}


	mpg.addNewLevel = function()
	{
		mpg.newLevel.details = JSON.parse('{"backgrounds":["x0"],"enemies":[],"goodies":[]}');
		mpg.saveLevel(mpg.newLevel);
	}

	//getter and setter for "outside"
	mpg.setInterface = function(name)
	{
		if(name === "overview")
		{
			if(!confirm("Ungespeicherte Daten gehen verloren, wenn Sie fortfahren!"))
				return;
			mpg.setRunning(false);
			//setConfig("loadedLevel", "empty");
			mpg.npc = false;
		}

		mpg.interface = name;
		$scope.$apply();
	}

	mpg.setNpc = function(npc)
	{
		mpg.npc = npc;
		$scope.$apply();
	}

	mpg.setLevelDetails = function(lvl)
	{
		mpg.loadedLevel.details = lvl;
		$scope.$apply();
	}

	mpg.getNpc = function()
	{
		return mpg.npc;
	}
	mpg.getRunning = function()
	{
		return mpg.running;
	}
	mpg.setRunning = function(r)
	{
		mpg.running = r;
	}

	mpg.getInterface = function()
	{
		return mpg.interface;
	}

});
