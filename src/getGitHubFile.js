

/*
 * Example showing the code to retrieve snippets from GitHub
 * for use a Test scripts. Stored in the code_getTestScripts
 * environment variable
*/
//Setup the URL components


const http = require('http');

async function get_page(theUrl) {
    const url = theUrl;

    return new Promise((resolve) => {
        let data = ''

        https.get(url, res => {

            res.on('data', chunk => { data += chunk }) 

            res.on('end', () => {

               resolve(do_awesome_things_with_data(data));

            })
        }) 
    })
}






function getGitHubContent(GitHubConfigInfo) {


var token = pm.environment.get("GitHub_PAT");


console.log("REF: ", GitHubConfigInfo.ref);
console.log("REF UNDEF: " + (GitHubConfigInfo.ref === ''));
var url = GitHubConfigInfo.APIBaseUrl + "/repos/" + GitHubConfigInfo.repoSlug + "/contents/" + GitHubConfigInfo.filepath + ((GitHubConfigInfo.ref === undefined || GitHubConfigInfo.ref === '') ? '' : '?ref=' + GitHubConfigInfo.ref);
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
var buff = Buffer.from(base64content, 'base64');
var content = buff.toString('ascii');
return content;
});
}

var ghci = {};

ghci.ref = 'rationalize-variables';
ghci.repoSlug = 'bidnessforb/bian-validation';
ghci.filepath = 'src/scripts/request/pre-request.js';
ghci.APIBaseUrl = 'https:/api.github.com';

console.log(getGitHubContent(ghci));