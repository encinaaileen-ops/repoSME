function isExternal(link) {
	
	var currentUrl = stripDownLink(window.location.href);
	var externalUrl = stripDownLink(link);

	return currentUrl.Length <= 0 || externalUrl.Length <= 0 || currentUrl != externalUrl;
}

function stripDownLink(link) {
	
	var resultString = link;
	var doubleSlashPosition = link.indexOf("//");
	if (doubleSlashPosition > 0)
	{
		resultString = resultString.substring(doubleSlashPosition + 2);
	}

	var wwwwPosition = resultString.indexOf("www.");
	if (wwwwPosition > 0)
	{
		resultString = resultString.substring(wwwwPosition + 4);
	}

	var lastSlashPosition = resultString.indexOf("/");
	if (lastSlashPosition > 0)
	{
		resultString = resultString.substring(0, lastSlashPosition);
	}

	return resultString;
}