var http = require('http');
var WebSocketServer = require('websocket').server;

var server = http.createServer(function(request, response) {});
var port = 1234;




server.listen(port, function()
{
	console.log("server start");
});

wsServer = new WebSocketServer(
{
	httpServer: server
});


var connCount = 0;
var nextId = 0;
var nextGId = 0;
var clients = {};
var gameServers = {};
var wsUpdateTime;

function res(connection, respType, msg, type)
{
	var packet = {respType:respType,type:type,msg:msg};
	//console.log("sending back: " + JSON.stringify(packet));
	connection.sendUTF(JSON.stringify(packet));
}

function resA(clients, respType, msg, type)
{
	for(var i in clients)
	{
		res(clients[i].conn, respType, msg, "success");
	}
}

wsServer.on('request', function(r)
{
	var connection = r.accept('echo-protocol', r.origin);

	clients[nextId] =
	{
		conn: connection,
		id: nextId,
		game: false,
		lastSeen: new Date()
	};
	console.log("new Connection: " + connection.remoteAddress);
	res(clients[nextId].conn, "login", {id:nextId}, "success");

	nextId ++;
	connCount ++;


	connection.on('message', function(data)
	{
		//console.log(data);
		try
		{
			var d = JSON.parse(data.utf8Data);
		}
		catch(e)
		{
			d={request:"unknown"};
		}

		switch(d.request)
		{
			case "readLobby":
				resA(clients, d.request, gameServers, "success");
				break;


			case "createGame":
				d.game.count = 0;
				d.game.players = {};
				gameServers[d.game.name] = d.game;
				nextGId ++;
				res(connection, d.request, d.game, "success");
				resA(clients, "readLobby", gameServers, "success");
				break;


			case "joinGame":
				console.log(d.id + " joins " + d.gameName);
				if(!gameServers[d.gameName])
				{
					res(connection, d.request, "game not found!", "fail");
					break;
				}
				gameServers[d.gameName].count ++;
				gameServers[d.gameName].players[d.id] = {x:0,y:0,s:1,a:0};
				clients[d.id].game = gameServers[d.gameName];
				res(connection, "joinGame",gameServers[d.gameName], "success");
				resA(clients, "readLobby", gameServers, "success");
				break;


			case "leaveGame":
				console.log(d.id + " leaves " + d.game.name);
				if(!gameServers[d.game.name])
				{
					break;
				}
				gameServers[d.game.name].count --;

				delete gameServers[d.game.name].players[d.id];

				checkAndDeleteGame(d.game.name);


				res(connection, d.request, "", "success");
				break;


			case "tick":
				if(clients[d.id])
					clients[d.id].lastSeen = new Date();
				removeOutTimedClients(clients);
				break;


			case "update":
				if(d.gameName)
				{
					if(!gameServers[d.gameName])
					{
						break;
					}

					if(!gameServers[d.gameName].players)
						break;

					if(gameServers[d.gameName].players[d.id])
						gameServers[d.gameName].players[d.id] = d.player;



					if(wsUpdateTime === undefined)
						wsUpdateTime = new Date();
					if(new Date().getTime() - wsUpdateTime.getTime() > 50)
					{
						var toUpdate = getAllClientsFromGame(d.gameName);
						resA(toUpdate, "update", gameServers[d.gameName].players, "success");
						wsUpdateTime = new Date();
					}
				}
				break;


			case "msg":
				for(var i in clients)
				{
					clients[i].conn.sendUTF(msgString);
				}
				break;


			case "unknown":
			default:
				console.log("unknown request: " + JSON.stringify(d));
				res(connection, d.request, d.request, "unknown");
		}
	});

	connection.on('close', function(reasonCode, description)
	{
	});
});


function removeOutTimedClients(clients)
{
	for(var i in clients)
	{
		if((new Date-clients[i].lastSeen) > 5000)
		{
			console.log("Disconnected: " + clients[i].conn.remoteAddress);

			if(clients[i].game)
			{
				delete clients[i].game.players[i];
				clients[i].game.count = Object.keys(clients[i].game.players).length;
			}

			checkAndDeleteGame(clients[i].game.name);

			connCount --;
			delete clients[i];
			resA(clients, "readLobby", gameServers, "success");
		}
	}
}

function checkAndDeleteGame(gameName)
{
	if(gameServers[gameName] && gameServers[gameName].count < 1)
	{
		delete gameServers[gameName];
		resA(clients, "readLobby", gameServers, "success");		//update all clients
		console.log("deleting empty game: " + gameName);
	}
}

function getAllClientsFromGame(gameName)
{
	var toUpdate = {};
	for(var i in gameServers[gameName].players)
	{
		for(var j in clients)
		{
			if(clients[j].id == i)
				toUpdate[i] = clients[i];
		}
	}
	return toUpdate;
}
