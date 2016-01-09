
function sse(callback,parameters)
{
	var get = "";
	if(parameters)
	{
		var start = true;

		for(var i in parameters)
		{
			if(start)
			{
				get += "?";
				start = false;
			}
			else
			{
				get += "&";
			}
			get+=i+"="+parameters[i];
		}
	}

	var server = angular.element(document.getElementById('levelBuilder')).controller().getBACKEND_HOST();
	var source = new EventSource(server+get);
	source.onmessage = function(event)
	{
		var data = JSON.parse(event.data)
		if(!data)
			die("JSON error");
		if(data.error)
			die(data.error);

		if(event.error)
			die("fehler: " + event.error);
		else if(event.data)
			callback(event.data);
		else
			alert("Keine behandelbaren Daten erhalten");
	};
}
