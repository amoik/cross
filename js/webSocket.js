var wsSocket;
var wsConnectiton;
var myId;



function wsConnect(server, callbackO, callbackC)
{
	wsSocket = new WebSocket(server, 'echo-protocol');
	wsSocket.onclose = function()
	{
		callbackC();
	}
	wsSocket.error = function()
	{
		alrt("Es konnte keine Verbindung hergestellt werden\ngeh ham!");
	}
	wsSocket.onopen = function()
	{
		callbackO();
		wsEndless();
	}
}

function wsSend(msg)
{
	msg.id = myId;
	wsSocket.send(JSON.stringify(msg));
}

function wsAddListener(callback)
{
	wsSocket.onmessage = function(e)
	{
		var data = wsCalcAnswer(e);
		if(data)
			callback(data.type,data.msg);
	}
}

function wsCalcAnswer(e)
{
	//console.log("wsSend response: " + e.data);
	var resp;
	try
	{
		resp = JSON.parse(e.data);
	}
	catch(e)
	{
		resp = {type:"fail",msg:"fehler beim parsen"};
	}

	if(resp.type === "success")
		return {msg:resp.msg,type:resp.respType};
	else if(resp.type === "fail")
		alrt("es ist ein fehler mit einem WebSocket Aufruf aufgetreten("+resp.msg+")");
	else if(resp.type === "unknown")
		alrt("der Server konnte mit der Nachricht nichts anfangen("+resp.msg+")");
}


var wsTickTime;
var wsUpdateTime;

function wsEndless()
{
	if(wsTickTime === undefined)
		wsTickTime = new Date();
	if(new Date().getTime() - wsTickTime.getTime() > 1000)
	{
		wsSend({request:"tick",id:myId});
		wsTickTime = new Date();
	}



	if(wsUpdateTime === undefined)
		wsUpdateTime = new Date();
	if(new Date().getTime() - wsUpdateTime.getTime() > 50)
	{
		var game = angular.element(document.getElementById('mpGame')).controller().getGame();

		if(game.players && game.players[(""+ myId)])
			wsSend({request:"update",player:game.players[(""+ myId)],gameName:game.name});
		wsUpdateTime = new Date();
	}

	requestAnimFrame(function()
	{
		wsEndless();
	});
}
