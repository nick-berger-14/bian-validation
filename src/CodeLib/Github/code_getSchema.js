/*
 * Example showing the code to retrieve snippets from GitHub
 * for use as PreRequest scripts. Stored in the code_getPreRequestScripts
 * environment variable
*/
//Setup the URL components
var token = pm.environment.get("GitHubPAT");
var baseUrl = pm.collectionVariables.get("GitHub_APIBaseURL");
//Build the URL
var url = baseUrl + "/" + pm.collectionVariables.get("GitHub_schemaPath");
console.log("URL: " + url);
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
pm.collectionVariables.set("schema_json", content);
});