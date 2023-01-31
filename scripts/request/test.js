const yaml =  pm.environment.get('js_yaml');
(new Function(yaml))();
  //Mutate the schema to require all properties, custom for each ref :(
  function requireAll (schema) {
    if(status != 200) {
        return schema;
    }
    var newSchema = {};
    newSchema.type = schema.type;
    newSchema.properties = schema.properties;
    //schema.schema.required = Object.keys(schema.schema.properties);
    newSchema.required = Object.keys(schema.properties);
    newSchema.additionalProperties = false;
    //schema.schema.properties.PaymentInitiationTransaction.required = Object.keys(schema.schema.properties.PaymentInitiationTransaction.properties);
    newSchema.properties.PaymentInitiationTransaction.required = Object.keys(schema.properties.PaymentInitiationTransaction.properties);
    newSchema.properties.PaymentInitiationTransaction.additionalProperties = false;
    return newSchema
  };

var api = 'Payment Initiation'; //need to make this dynamic
var path = pm.environment.get("schema_path");  //need to make this dynamic
var method = pm.request.method.toLowerCase(); //Set dynamically

// Use the value of the `x-mock-response-code` header if it exists, is not disabled, and if the `use-response-code` 
// environment variable is set to `true`.  The header is configured in the pre-request script
if(pm.request.headers.has("x-mock-response-code")) {
    var status = pm.request.headers.one("x-mock-response-code").disabled ? 200 : parseInt(pm.request.headers.get("x-mock-response-code"));
    
    status = (status == undefined || isNaN(status)  ? 200 : status);
}

//Hardcode status to something different from that returned by the above
//status = 200;


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
// TODO: this should all be dynamic somehow, maybe by tracing request path
var postman_api_key = pm.environment.get("postmanApiKey");
var api_id = pm.environment.get("apiId");
var api_version_id = pm.environment.get("apiVersionId");
var schema_id = pm.environment.get("schemaId");

// Pull the OpenAPI from the Postman API
// We're just after a schema here and it's not going to change, should we just go straight to BIAN?
var api_url = 'https://api.getpostman.com/apis/' + api_id + '/versions/' + api_version_id + '/schemas/' + schema_id;

const apiRequest = {
  url: api_url,
  method: 'GET',
  header: 'X-Api-Key:' + postman_api_key,
};
//Get the API
pm.sendRequest(apiRequest, function (err, res) {

    if (err) {
        console.log(err);
    } else {   

        // Pull Schema from API response        
        var api_response = res.json();  
        
        //Convert from YAML to JSON, should probably test for schema format first
        var openapi = jsyaml.load(api_response.schema.schema);
        
        // Grab the schema element for this specific response from the response (which is the complete schema)
        var res = openapi.paths[path][method].responses[status]['$ref'];
        
        // Clean it up a bit
        res = res.replace('#/components/responses/', '');

        // Pull the top-level Object from the sub-schema, this is the ref used for labelling below
        var ref = openapi.components.responses[res].content['application/json'].schema['$ref'];
        ref = ref.replace('#/components/schemas/', '');
        
        //Pull out the individual sub-schema element itself
        var item = openapi.components.schemas[ref];

        // Prepare what is needed for AJV
        var schema = {};
        schema.type = "object"
        schema.items = item;
        
        // Validate the response with AJV
        var Ajv = require('ajv');
        ajv = new Ajv({logger: console});
        var data = pm.response.json();
        item = requireAll(item);
        console.log(JSON.stringify(item));
        const validate = ajv.compile(item);
        const valid = validate(data);

        pm.test('Validating response against ' + ref + ' schema from the ' + api + ' OpenAPI', function() {
            var data = pm.response.json();
            pm.expect(valid).to.be.true;
        });

    }    

});
