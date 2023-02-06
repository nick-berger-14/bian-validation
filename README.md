# bian-validation

Experment to test boot-strapping Postman test scripts from GitHub as well as validating Request and Response bodies in real-time using AJV.  After a simple configuration process, pre-request and test scripts are dynamically loaded from GitHub and executed against every request in the collection.  Pre-request and test scripts can be edited in your favorite editor, committed to GitHub, and will immediately run in Postman.  

## Setup
1. Clone the repo
1. Import the `PaymentInitiation` collection from `/resources/postman/collections/Payment Initiation - DEV.postman_collection.json`
1. Import the `PaymentInitiation` environment from `resources/postman/environments/Payment Initiation - DEV.postman_collection.json`
1. Update the Environment with your API Keys and tokens. NOTE: Only set current values to prevent token/key leakage.
    * `GitHub_PAT`: Your GitHub Personal Access Token scoped to this repo
    * `PostmanAPIKey`: Your Postman API key
1. Run any of the requests in the collection, test results should be displayed: 

  ![image](https://user-images.githubusercontent.com/6423235/216870744-db107968-75ac-4916-8e8d-cf385627e06c.png)
  
## What's happening
The intention is to provide a way to pre-load Pre-Request and Test scripts, as well as any other source code like third party libraries from a GitHub repo into Collection variables at run time.  Each request in the collection then need only `eval` the contents of those variables in order to execute the pre-request and test scripts.  The Collection has a single-line pre-request script that evaluates code stored in the `code_getGitHubArtifact` environment variable.  This script is the only code that must be maintained as a variable in the collection, the rest is loaded at runtime from GitHub using this script.  The `code_getGitHubArtifact` connects to GitHub using the configuration variables defined in the `[gh_config]` collection variable: 

```JSON
{
    "slug": "bidnessforb/bian-validation",
    "files" : [
        {
        "path": "src/scripts/request/pre-request.js"
        ,"ref": "simplify-variables"
        ,"target": "CodeLibrary_preRequestScript"
        }
        ,{
            "path": "src/scripts/request/test.js"
            ,"ref": "simplify-variables"
            ,"target": "CodeLibrary_testScript"
        }
        ,{
            "path": "src/CodeLib/Postman/js_yaml.js"
            ,"ref": "simplify-variables"
            ,"target": "CodeLibrary_js_yaml"
        }
        
    ]
}
```
| Property | Description | Type |
|----|----|----|
| `slug` | The GitHub repo slug, eg `owner/repo` | String |
| `files` | An array of one or more files to retrieve from GitHub | String array | 
| `path` | The path to the target file from the root of the repo | String |
| `ref` | The Git REF, generally the branch, from which to retrieve the file.  Set to `null` to default to the default branch | String or null |
| `target`| The target collection variable to populate with the file retrieved from GitHub.  This variable will be updated if it exists or created if it does not | String | 

An example `gh_config` is stored in the repo [here](https://github.com/BidnessForB/bian-validation/blob/simplify-variables/src/config/gh_config.json)

## Updating Pre Request and Test Scripts

1. Clone the repo, if you have not done so already
2. Create a branch, e.g., `update-scripts`
3. Edit your scripts
4. Update the value of the `ref` property for each of the `file` elements in the `gh_config` collection variable
5. Commit to Git and push to GitHub
6. Run your request, the scripts are updated every time a Request is executed.  

## Contract Validation

This example is validating requests against the [`Payment Initiation`](https://bian.org/semantic-apis/payment-initiation/) API maintained by BIAN.  This API was previously loaded into Postman in the [Open Technologies team BIAN Workspace](https://www.postman.com/postman/workspace/postman-open-technologies-banking-industry-architecture-network-bian/api/840e822a-3c44-4351-a2a2-cd0b123c834c).  

## Configuring the App

The `ct_config` collection variable contains the various configuration switches consumed by the app.

|Property | Description | Type | 
|---|---|---|
| `api` | Properties necessary to retrieve the subject API from Postman | Object | 
| `api.id` | The Postman UID for the subject API | String | 
| `api.versionID` | The Postman API Version UID for the subject API | String | 
| `api.schemaID`| The Postman API Schema UID for the subject API | String | 
| `mockResponseCode` | Value to use in a dynamically created `x-mock-response-code` header to prompt the Postman mock server to return a specific response body keyed to that HTTP status | String |
| `useMockResponse` | Flag to enable/disable the mock response feature | boolean |
| `forceConflict` | Whether to simulate a failed validation | boolean | 

### Forcing Required Values

Because the original BIAN API did not have any required properties in its Request and Response body definitions, everything would validate against it, including an empty request.  As an interim fix the [requireAll](https://github.com/BidnessForB/bian-validation/blob/b1aaf7b85dba031999f744bdfca9b4abfb582589/src/scripts/request/test.js#L28) function was added to the test script to dynamically update the schema at runtime, making all properties `required`.  

### Dymamic Mock Responses

By default the existing Postman Mock Server will return a 200 status code for the requests as currently configured.  However, you can specify another HTTP response code to be used via a dynamically set [x-mock-response-code](https://learning.postman.com/docs/designing-and-developing-your-api/mocking-data/mock-with-api/#matching-a-response-name-or-id) header.  To use a mock response code:
1. Update the `ct_config` environment variable, setting:
    * `mockResponseCode` to the status code you wish to simulate, e.g., 401
    * `useMockResponse` to `true`

The `x-mock-response-code` header is created and set dynamically, it doesn't have to already exist on the request, nor will it be persisted with the request after the call.  

### Forcing a Validation conflict

If desired for demo purposes, you can "fool" the scripts into believing that the response body is invalid.  This is done by explicitly setting the expected HTTP status code back to 200, rather than whatever is set in the `x-mock-response-header`.  Thus, if the `x-mock-response-header` contains a 401, the 401 error body will not validate against the (incorrectly) expected 200 body schema.  

To force a conflict:
1. Configure a mock response code other than 200.
2. Set the `forceConflict` property of the `ct_config` collection variable to `true`

### Where stuff is

| Element | Path | Description |
|---|---|---|
| PaymentInitiation Collection |  ./resources/postman/collectionsPayment Initiation - DEV.postman_collection.json | The example collection |
| PaymentInitiation Environment | ./resources/postman/collectionsPayment Initiation - DEV.postman_collection.json | The Example environment | 
| Test Script | src/scripts/request/test.js | The test script loaded from GitHub and executed for every request in the collection | 
| Pre Request Script | src/scripts/request/pre-request.js | The pre-request script loaded from GitHub and executed for every request in the collection | 
| code_getGitHubArtifact.js | src/CodeLib/GitHub/code_getGitHubArtifact.js | A reference copy of the code which retrieves aftifacts from GitHub.  This file must be maintained in the `code_getGitHubArtifact` environment variable if any changes are made.  | 
| js_yaml.js | src/CodeLib/GitHub/js_yaml.js | Source code for the [js-yaml](https://github.com/nodeca/js-yaml) YAML -> JSON conversion utility | |








