const yaml =  pm.environment.get('js_yaml');
(new Function(yaml))();

var api = 'Payment Initiation';

var path = pm.environment.get("schema_path");
//var method = 'get';
var method = pm.request.method.toLowerCase();
var status = 200; //default
//BRKC Let's make it dynamic with different responses.
console.log("TEST 1: " + ( pm.environment.get('use_mock_response') === "true"));
console.log("USE MOCK: " + pm.environment.get('use_mock_response'));
console.log("HAS: " + pm.request.headers.has("x-mock-response-code"));
console.log("DISABLED: " + pm.request.headers.one("x-mock-response-code").disabled);
console.log("VALUE: " + pm.request.headers.one("x-mock-response-code").value);


if(pm.request.headers.has("x-mock-response-code") && !pm.request.headers.one("x-mock-response-code").disabled) {
    var status = parseInt( pm.request.headers.one("x-mock-response-code").value);
    status = (status === undefined || isNaN(status)) ? 200 : status;
}
console.log("STATUS: " + status); 

// First Test - Baseline Status Code
pm.test("Status code is " + status, function () {
    pm.response.to.have.status(status);
    
});

// Pull variables needed to pull the OpenAPI
var postman_api_key = pm.environment.get("postmanApiKey");
var api_id = pm.environment.get("apiId");
var api_version_id = pm.environment.get("apiVersionId");
var schema_id = pm.environment.get("schemaId");

// Pull the OpenAPI from the Postman API
var api_url = 'https://api.getpostman.com/apis/' + api_id + '/versions/' + api_version_id + '/schemas/' + schema_id;

const apiRequest = {
  url: api_url,
  method: 'GET',
  header: 'X-Api-Key:' + postman_api_key,
};

pm.sendRequest(apiRequest, function (err, res) {

    if (err) {
        console.log(err);
    } else {   

        // Pull Schema from API response        
        var api_response = res.json();  
        
        
        var openapi = jsyaml.load(api_response.schema.schema);
        
        // Grab the Response
        console.log("METHOD: " + method + " STATUS: " + status + " PATH: " + path);
        var res = openapi.paths[path][method].responses[status]['$ref'];
        
        res = res.replace('#/components/responses/', '');

        // Grab the Schema
        var ref = openapi.components.responses[res].content['application/json'].schema['$ref'];
        ref = ref.replace('#/components/schemas/', '');
        
        var item = openapi.components.schemas[ref];

        // Prepare what is needed for AJV
        var schema = {};
        schema.type = "object"
        schema.items = item;
        
        // Validate the response with AJV
        var Ajv = require('ajv');
        ajv = new Ajv({logger: console});
        pm.test('Validating response against ' + ref + ' schema from the ' + api + ' OpenAPI', function() {
            var data = pm.response.json();
            pm.expect(ajv.validate(schema, data)).to.be.true;
        });

    }    

});
