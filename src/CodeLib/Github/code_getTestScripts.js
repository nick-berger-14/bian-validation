/*
 * Example showing the code to retrieve snippets from GitHub
 * for use a Test scripts. Stored in the code_getTestScripts
 * environment variable
*/
//Setup the URL components
var owner = pm.collectionVariables.get("owner");
var repoSlug = pm.collectionVariables.get("GitHub_repoSlug");
var path = pm.collectionVariables.get("GitHub_testScriptsPath");
var token = pm.environment.get("GitHub_PAT");
var baseUrl = pm.collectionVariables.get("GitHub_APIBaseURL");
var ref = pm.collectionVariables.get("GitHub_currentBranch");
//Build the URL
console.log("REF: ", ref);
console.log("REF UNDEF: " + (ref === ''));
var url = baseUrl + "/repos/" + repoSlug + "/contents/" + path + ((ref === undefined || ref === '') ? '' : '?ref=' + ref);
console.log("GitHub Test Script URL: " + url);
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
pm.collectionVariables.set("CodeLibrary_testScripts", content);
});
