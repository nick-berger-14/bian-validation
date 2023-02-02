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

pm.environment.set("ct_runtime_schemaPath", schemaPath);



if(pm.environment.get("ct_config_useMockResponse") === "true") {
    console.log("SETTING MOCK ")
    pm.request.headers.upsert({'key':'x-mock-response-code', 'value':'{{ct_config_mockResponseCode}}','disabled':false});
}
else {
    console.log("NOT SETTING MOCK ")
    pm.request.headers.upsert({'key':'x-mock-response-code', 'value':'{{ct_config_mockResponseCode}}','disabled':true});
}
