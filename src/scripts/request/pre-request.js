/*
NOTE: This code is stored in GitHub:
https://github.com/BidnessForB/bian-validation/blob/main/scripts/request/pre-request.js

*/


var path = pm.request.url.getPath(true);
var paths = pm.request.url.path;
var schemaPath = '';

paths.forEach(path => {
    if(path.substring(0,1) === ':') {
        path = "{" + path.substring(1) + "}";
    }
        schemaPath = schemaPath + "/" + path;
});

console.log("REQUEST ", pm.request);

pm.collectionVariables.set("ct_runtime_schemaPath", schemaPath);

var config = JSON.parse(pm.collectionVariables.get("ct_config"));

pm.request.headers.upsert({'key':'x-mock-response-code', 'value':'\'' + config.mockResponseCode + '\'','disabled':config.useMockResponse});
