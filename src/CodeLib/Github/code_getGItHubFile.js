/*
 * Example showing the code to retrieve snippets from GitHub
 * for use as pre-reqiuest scripts. Stored in the CodeLibrary_getPreRequestScripts
 * environment variable
*/
//Setup the URL components
function getGitHubArtifact(slug, path, ref, target)
var repoSlug = pm.collectionVariables.get("GitHub_repoSlug");
var path = pm.collectionVariables.get("GitHub_preRequestScriptsPath");
var token = pm.environment.get("GitHub_PAT");
var baseUrl = pm.collectionVariables.get("GitHub_APIBaseURL");
var ref = pm.collectionVariables.get("GitHub_currentBranch");
console.log("REF: " + ref);
console.log("REF UNDEF: " + (ref === ''));
//Build the URL.  If ref is defined and not '', append it to pull from the specific ref (branch)
var url = baseUrl + "/repos/" + repoSlug + "/contents/" + path + ((ref === undefined || ref === '') ? '' : '?ref=' + ref);
console.log("GitHub Pre Request Script URL: " + url);
const postRequest = {
 url: url,
 method: 'get',
 header: {
 'Content-Type': 'application/json',
 'Authorization': 'bearer ' + token
 }
};
pm.sendRequest(postRequest, (err, res) => {
 var jsonData = JSON.parse(res.text());
var base64content = jsonData.content;
var buff = new Buffer(base64content, 'base64');
var content = buff.toString('ascii');
pm.collectionVariables.set(target, content);
});
