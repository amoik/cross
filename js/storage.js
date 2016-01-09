const lsKey = "mpGame";

function setConfig(key, data)
{
	var con = JSON.parse(localStorage.getItem(lsKey));
	if(con === null || con === undefined)
		con = Object();
	con[key] = data;

	localStorage.setItem(lsKey, JSON.stringify(con));

	return true;
}

function getConfig(key)
{
	var con = JSON.parse(localStorage.getItem(lsKey));

	if(!con || !con[key])
		return false;

	return con[key];
}

function resetConfig()
{
	//remove the old config
	localStorage.removeItem(lsKey);
	alert("Erfolgreich zurückgesetzt");
}
