







function AJAXCall(info, successfunction)
{
	$.ajax(
	{
		url: angular.element(document.getElementById('levelBuilder')).controller().getBACKEND_HOST(),
		type: "POST",
		dataType: "html",
		data: info,
		timeout: 5000

	}).done(function(result)
	{
		var res = "";

		try
		{
			var res = JSON.parse(result)
		}
		catch (e)
		{
			die(result);
			return false;
		}

		if(res.return === true)
		{
			successfunction(res.data);
		}
		else
		{
			var res = JSON.parse(result);
			die(res.msg);
		}

	}).fail(function(jqXHR, status)
	{
		die(result);
	});
}


