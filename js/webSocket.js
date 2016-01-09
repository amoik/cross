var wsSocket;
var wsConnectiton;



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
	}
}

function wsSend(msg)
{
	wsSocket.send(JSON.stringify(msg));
}

function wsAddListener(name, callback)
{
	wsSocket.onmessage = function(e)
	{
		console.log("wsSend response: " + e.data);
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
			callback(resp.msg);
		else if(resp.type === "fail")
			alrt("es ist ein fehler mit einem WebSocket Aufruf aufgetreten("+resp.msg+")");
	}
}






