/*
 * Example showing the code to retrieve snippets from GitHub
 * for use as pre-reqiuest scripts. Stored in the CodeLibrary_getPreRequestScripts
 * environment variable
*/
//Setup the URL components
var ghci = JSON.parse(pm.collectionVariables.get('gh_config'));
console.log(ghci);
token = pm.environment.get("GitHub_PAT");
for(i = 0; i < ghci.files.length; i++)
{
    var file = ghci.files[i];
    //var baseUrl = pm.collectionVariables.get("GitHub_APIBaseURL");
    baseUrl = 'https://api.github.com'
    //var ref = pm.collectionVariables.get("GitHub_currentBranch");
    //Build the URL.  If ref is defined and not '', append it to pull from the specific ref (branch)
    var url = baseUrl + "/repos/" + ghci.slug + "/contents/" + file.path + ((file.ref === undefined || file.ref === null || file.ref === '') ? '' : '?ref=' + file.ref);
    const postRequest = {
    url: url,
    method: 'get',
    header: {
    'Content-Type': 'application/json',
    'Authorization': 'bearer ' + token
    }
    };
    sendRequest(postRequest, file.target);
}    
    
function sendRequest(postRequest, target) {
    
    pm.sendRequest(postRequest, (err,res) =>  {
        var jsonData = JSON.parse(res.text());
        var base64content = jsonData.content;
        var buff = new Buffer(base64content, 'base64');
        var content = buff.toString('ascii');
    
        pm.collectionVariables.set(target, content);
    });
}
