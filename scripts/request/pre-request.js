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

//Wouldn't it be cool if we could actually do this?
//pm.request.headers.upsert({"key":"x-mock-response-code","value":"{{response-code}}","disabled":(pm.environment.get("use_mock_response") === "false") });





