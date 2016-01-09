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


var count = 0;
var nextId = 0;
var clients = {};
var gameServers = [];

function res(connection, msg, type)
{
	var packet = {type:type,msg:msg};
	//console.log("sending back: " + JSON.stringify(packet));
	connection.sendUTF(JSON.stringify(packet));
}


wsServer.on('request', function(r)
{
	var connection = r.accept('echo-protocol', r.origin);
	var id = nextId++;
	count ++;
	clients[id]=
	{
		conn: connection,
		id: id
	};
	console.log("new Connection: " + connection.remoteAddress);

	connection.on('message', function(data)
	{
		console.log(data);
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
				res(connection, gameServers, "success");
				break;
			case "createGame":
				console.log("new game: "+d.game.name);
				d.game.count = 0;
				gameServers.push(d.game);
				res(connection, "", "success");
				break;
			case "joinGame":
				var g = findGameByName(d.game);
				if(!g)
				{
					console.log("ERROR: requested game not found!");
					res(connection, "", "fail");
				}

				g.count ++;
				res(connection, "", "success");
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
				connection.sendUTF("unknown");
		}
	});

	connection.on('close', function(reasonCode, description)
	{
		count --;
		delete clients[id];
		console.log("Disconnected: " + connection.remoteAddress);
	});
});



function findGameByName(n)
{
	for(var i = 0; i < gameServers.length; i++)
	{
		if(n == gameServers[i].name)
			return gameServers[i];
	}
	return false;
}
