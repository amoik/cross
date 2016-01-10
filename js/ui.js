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


var DRAWGAME;

var mpGame = angular.module('mpGame', []).controller('mpGameCtr', function($scope)
{
	modal.showPleaseWait();
	var mpg = this;
	mpg.title = "Multiplayer Game";
	mpg.interface = "none";
	mpg.running = false;
	mpg.WS_SERVER = "ws://192.168.1.20:1234";
	mpg.game ={};
	mpg.games = {};


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
				wsSend({request:"readLobby"});
				mpg.addWsListener();
				mpg.setInterface("lobby");
			},
			function()
			{
				mpg.setInterface("welcome");
			}
		);
	}


	mpg.createGame = function()
	{
		if(mpg.checkIfGameNameExists(mpg.newGame.name))
		{
			alert("Der gewählte Name ist bereits vergeben!");
			return;
		}
		if(mpg.newGame.name == "")
		{
			alert("Es wurde kein Name gewählt!");
			return;
		}

		wsSend({request:"createGame",game:mpg.newGame});
		wsSend({request:"readLobby"});
	}
	mpg.logout = function()
	{
		setConfig("lobby",false);
		mpg.game={};
		mpg.setInterface("welcome");
	}

	mpg.joinGame = function(name)
	{
		wsSend({request:"joinGame",gameName:name,id:myId});
	}

	mpg.checkIfGameNameExists = function(n)
	{
		for(var i in mpg.games)
		{
			if(n === mpg.games[i].name)
				return true;
		}
		return false;
	}

	mpg.leaveGame = function()
	{
		wsSend({request:"leaveGame",game:mpg.game});
		mpg.game = {};
	}

	mpg.addWsListener = function()
	{
		wsAddListener(function(type, data)
		{
			switch(type)
			{
				case "login":
					myId = data.id;
					break;


				case "readLobby":
					mpg.games = data;
					$scope.$apply();
					break;


				case "createGame":
					mpg.joinGame(data.name);
					break;


				case "joinGame":
					mpg.game=data;
					DRAWGAME = data;
					mpg.setInterface("inGame");
					if(!canvDraw(mpg.game))
					{
						mpg.setInterface("lobby");
						mpg.leaveGame();
					}
					break;


				case "leaveGame":
					wsSend({request:"readLobby"});
					mpg.setInterface("lobby");
					break;


				case "update":

					if(!mpg.game.players)
						mpg.game.players = data;
					else	//if there is already data, we dont update ourself!
					{
						for(var i in mpg.game.players)
						{
							if(parseInt(i) != myId)
							{
								if(!data[i])
									delete mpg.game.players[i];
								mpg.game.players[i] = data[i];
							}
						}
					}
					break;


				default:
					alert("Unbekannten typ vom WS erhalten!\n" + type);
			}
		});
	}
































	mpg.saveTmp = function(lvl)
	{
		mpg.loadedLevel.details = lvl;
		//setConfig("loadedLevel", mpg.loadedLevel);
	}


	mpg.getGamesEmpty = function()
	{
		if(JSON.stringify(mpg.games) == "{}")
		{
			return true;
		}
		return false;
	}


	//getter and setter for "outside"
	mpg.setInterface = function(name)
	{
		mpg.interface = name;
		$scope.$apply();
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

	mpg.getGame = function()
	{
		return mpg.game;
	}
	mpg.setGame = function(g)
	{
		mpg.game = g;
	}

});
