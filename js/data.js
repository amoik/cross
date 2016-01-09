function data_Levels(target)
{
	AJAXCall({function:"getLevels"},function(res){target = res;});
}
