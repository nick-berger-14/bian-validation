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

pm.environment.set("schema_path", schemaPath);

if(pm.environment.get("use_mock_response") === "true") {
    pm.request.headers.upsert({'key':'x-mock-response-code', 'value':'{{response-code}}','disabled':false});
}
else
{
    pm.request.headers.upsert({'key':'x-mock-response-code', 'value':'{{response-code}}','disabled':true});
}






