

var mpGame = angular.module('mpGame', []).controller('mpGameCtr', function($scope)
{
	modal.showPleaseWait();
	var mpg = this;
	mpg.picture = "data:image/  png;base64,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";

	mpg.myPicture;
	mpg.title = "Multiplayer Game";
	mpg.interface = "none";
	mpg.running = false;
	mpg.WS_SERVER = "ws://84.115.3.61:8543";
	mpg.game ={};
	mpg.games = {};
	mpg.playerPictures = {};


	angular.element(document).ready(function ()
	{
		$("#userPhotoVideo").hide();
		modal.hidePleaseWait();
		var savedSocket = getConfig("lobby");
		if(savedSocket && savedSocket != "")
		{
			mpg.WS_SERVER = savedSocket;
		}
		mpg.login();
	});

	mpg.newGame = {name:"",maxCount:10};


	mpg.login = function()
	{

		wsConnect(
			mpg.WS_SERVER,
			function()
			{
				setConfig("lobby",mpg.WS_SERVER);
				mpg.addWsListener();
				mpg.setInterface("lobby");
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
	  mpg.running = false;
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
				  wsSend({request:"readLobby"});

					var uPic = getConfig("userPicture");
					if(uPic)
					{
				    mpg.savePicture(uPic);
			    }
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
					mpg.setInterface("inGame");
					if(!canvDraw(mpg.myPicture))
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
					if(myId)
					{
						if(mpg.game.players)
						{
							//save "us" in tmp
							var tmp = mpg.game.players[myId];
						}
						//override our data
						mpg.game.players = data;
						if(tmp);
						{
							//and override ourself with our own data
							mpg.game.players[myId] = tmp;
						}
					}
					break;

				case "userPicture":
					if(data.id != myId)
					{
						mpg.setOnePlayerPicture(data.id, data.picture);
					}
					break;


				default:
					alert("Unbekannten typ vom WS erhalten!\n" + type);
			}
		});
	}

	mpg.setOnePlayerPicture = function (id, png)
	{
		if(!mpg.playerPictures[id])
			mpg.playerPictures[id] = {};
		mpg.playerPictures[id].png = png;
		rebuildTexture({ang:angular.element(document.getElementById('mpGame')).controller()}, id);

	}




	mpg.setCanvasPicture = function(p)
	{
		var can = document.getElementById('userPhotoCanvas');
		if(can)
		{
			var context = can.getContext("2d");

			var img = new Image();
			img.onload = function ()
			{
				context.drawImage(img, 0, 0);
			}
			img.src = p;
		}
	}
	


	mpg.mediaStream;
	mpg.savePictureFromVideoTag = function()
	{
		var can = document.getElementById('userPhotoCanvas');
		var context = can.getContext('2d');
		can.width = 64;
		can.height = 64;
		context.drawImage(document.getElementById('userPhotoVideo'), 0, 0, 64, 64);
		var data = can.toDataURL('image/png');
		mpg.mediaStream.stop();
	  
	  mpg.savePicture(data);
		wsSend({request:"userPicture",picture:data,save:true});
	}

	mpg.savePicture = function(data)
	{
		var can = document.getElementById('userPhotoCanvas');
		var context = can.getContext('2d');
		can.width = 64;
		can.height = 64;

    drawing = new Image();
    drawing.src = data; // can also be a remote URL e.g. http://
    drawing.onload = function()
    {
      context.drawImage(drawing,0,0);
    };

		$("#userPhotoVideo").hide();
		$("#userPhotoCanvas").show();
		wsSend({request:"userPicture",picture:data,save:false});
		setConfig("userPicture",data);
		mpg.myPicture = data;
	}

	mpg.changePicture = function()
	{
		$("#userPhotoVideo").show();
		$("#userPhotoCanvas").hide();

		navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

		if(!navigator.getMedia)
		{
		  alrt("Dieses Ding beherrscht leider keine mediaDevices :(<br>Lade dir doch einen <a href='https://www.mozilla.org/de/firefox/new/' target='_blank'>Browser</a>,<br>oder noch besser gleich ein richtiges <a href='https://getfedora.org/de_CH/workstation/download/' target='_blank'>Betriebssystem</a> herunter");
			$("#userPhotoVideo").hide();
			$("#userPhotoCanvas").show();
			return;
		}

		var video = document.getElementById('userPhotoVideo');

		navigator.getMedia
		({
			video: true,
			audio: false
		},
		function(stream)
		{
			var vendorURL = window.URL || window.webkitURL;
			video.src = vendorURL.createObjectURL(stream);
			video.play();
			mpg.mediaStream = stream;
		},
		function(err)
		{
		  alrt("Dieses Ding beherrscht leider keine mediaDevices :(<br>Lade dir doch einen <a href='https://www.mozilla.org/de/firefox/new/' target='_blank'>Browser</a>,<br>oder noch besser gleich ein richtiges <a href='https://getfedora.org/de_CH/workstation/download/' target='_blank'>Betriebssystem</a> herunter");
			$("#userPhotoVideo").hide();
			$("#userPhotoCanvas").show();
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
		if(name == "lobby")
		{
			if(mpg.myPicture)
				mpg.setCanvasPicture(mpg.myPicture);
			else
				mpg.setCanvasPicture(mpg.picture);
		}
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

	mpg.getPicture = function()
	{
		return mpg.picture;
	}
	mpg.setGame = function(g)
	{
		mpg.game = g;
	}

	mpg.getPlayerPictures = function()
	{
		return mpg.playerPictures;
	}
});
