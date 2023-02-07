/*
NOTE: This code is stored in GitHub:
https://github.com/BidnessForB/bian-validation/blob/main/scripts/request/test.js

*/

const config = JSON.parse(pm.collectionVariables.get('ct_config'));
const yaml =  pm.collectionVariables.get('CodeLibrary_js_yaml');
(new Function(yaml))();


var api = 'Payment Initiation'; //need to make this dynamic
var path = pm.collectionVariables.get("ct_runtime_schemaPath");  //need to make this dynamic
var method = pm.request.method.toLowerCase(); //Set dynamically

// Pull variables needed to pull the OpenAPI
// TODO: this should all be dynamic somehow, maybe by tracing request path
var postman_api_key = pm.environment.get("Postman_APIKey");
var api_id = config.api.id
var api_version_id = config.api.versionID;
var schema_id = config.api.schemaID;

console.log("API ID: " + api_id + " API VERSION ID: " + api_version_id + " SCHEMA ID: " + schema_id);

// Pull the OpenAPI from the Postman API
// We're just after a schema here and it's not going to change, should we just go straight to BIAN?
var api_url = 'https://api.getpostman.com/apis/' + api_id + '/versions/' + api_version_id + '/schemas/' + schema_id;

  //Mutate the schema to require all properties, custom for each ref :(
  function requireAll (schema) {
    if(status != 200) {
        return schema;
    }
    var newSchema = {};
    newSchema.type = schema.type;
    newSchema.properties = schema.properties;
    newSchema.required = Object.keys(schema.properties);
    newSchema.additionalProperties = false;
    if(status == 200) {
        newSchema.properties.PaymentInitiationTransaction.required = Object.keys(schema.properties.PaymentInitiationTransaction.properties);
        newSchema.properties.PaymentInitiationTransaction.additionalProperties = false;
      }
    return newSchema
  };

  function validate(data, schema) {
    var Ajv = require('ajv');
    ajv = new Ajv({logger: console});
    if(config.setAllPropertiesRequired)
      schema = requireAll(schema);
    const validate = ajv.compile(schema);
    const valid = validate(data);
    return valid;
};

function resolveSchemaRef(apischema, ref) {
  //var refElems = paramsRef.split('\/');
  var refElems = ref.split('\/');
  var elem = apischema;
  if(refElems[0] === '#') {
      refElems.splice(0,1);
  }
  refElems.forEach(pathElem => {
      elem = elem[pathElem];
  });
  return elem;
}

function getRequestSchema(apischema, requestPath, method) {
  return apischema.paths[requestPath][method];
}

function getResponseSchema(apischema, requestPath, method, status, contentType) {
  contentType = 'application/json'; //hard coded for now till we figure out how to get it out of the headers.
  var respSchema = apischema.paths[requestPath][method].responses[status];
  var respObj;
  if(respSchema === undefined || respSchema === null) {
      return null;
  }
  if(respSchema.$ref !== undefined) {
      respObj = resolveSchemaRef(apischema, respSchema.$ref);
      if(respObj.content[contentType].schema.$ref !== undefined) {
          respSchema = resolveSchemaRef(apischema, respObj.content[contentType].schema.$ref);
          schemaData = {};
          schemaData.subSchema = respSchema;
          schemaData.ref = respObj.content[contentType].schema.$ref;
          return schemaData;
      }
  }
  return new Object();

}


function getSubSchemaYaml(schemapath, method, schemaYaml, type) {
    
    var schemaJson = jsyaml.load(schemaYaml);
    return getSubSchemaJson(schemapath, method, schemaJson, type);
};
 
/*function getSubSchemaJson(schemapath, method, schema, type) {
    
    var subComponent = type === 'request' ? 'requestBody' : 'responses';
    var subRef = type === 'request' ?'requestBodies' :'responses'; 
    var elem;

    var schemaData = {};
    schemaData.subSchema = "No Schema"
    schemaData.ref = "No Ref";
    //This is is terrible
  try {
      if(subComponent === 'responses') {
        elem = schema.paths[schemapath][method][subComponent][status]['$ref'];
      }
      else {
        elem = schema.paths[schemapath][method][subComponent]['$ref'];
      }
    }
    catch(err) {
      if(err.message === "Cannot read properties of undefined (reading '$ref')") {
        console.log("No " + type + "body found for method " + method + " on path: " + schemapath);
        return schemaData;
      }
      else {
          console.log(err);
      }
    }
    
    elem = elem.split('\/')[(elem.split('\/').length) - 1] 
    
    var elemRef = schema.components[subRef][elem].content['application/json'].schema['$ref'];
    //this is terrible also
    if(status != 200) {
        elemRef = elemRef.split('\/')[(elemRef.split('\/').length) - 1] //works for req and res 200
      }
      else {
        elemRef = elem.split('\/')[(elem.split('\/').length) - 1] //works for req and res 200
      }

    schemaData = {};
    schemaData.subSchema = schema.components.schemas[elemRef];
    schemaData.ref = elemRef;
    return schemaData;
};
*/


// Use the value of the `x-mock-response-code` header if it exists, is not disabled, and if the `use-response-code` 
// environment variable is set to `true`.  The header is configured in the pre-request script
if(pm.request.headers.has("x-mock-response-code")) {
    var status = pm.request.headers.one("x-mock-response-code").disabled ? 200 : parseInt(pm.request.headers.get("x-mock-response-code"));
    
    status = (status == undefined || isNaN(status)  ? 200 : status);
}

//Hardcode status to something different from that returned by the above
//This code executes if the `force_conflict` collection variable is set to true AND `use_mock_response` is set to true AND `response-code` is not 200
if(config.forceValidationConflict)
    status = 200;


// First Test - Baseline Status Code
pm.test("Status code is " + status, function () {
    pm.response.to.have.status(status);
});







const apiRequest = {
  url: api_url,
  method: 'GET',
  header: 'X-Api-Key:' + postman_api_key,
};
//Get the API
pm.sendRequest(apiRequest, function (err, res) {

    if (err) {
        pm.test('Error fetching schema for the ' + api + ': ' + e.message, function() {
                pm.expect(false).to.be.true;
            });
    } else {   

        // Pull Schema from API response        
        var api_response = res.json();  
        var schemaJson = jsyaml.load(schemaYaml);
        
        
        //var resBodySchemaData = getSubSchemaYaml(path, method, api_response.schema.schema, "response");
        var resBodySchemaData = getResponseSchema(schemaJson, path, method, status, 'application/json');
        var reqBodySchemaData = getRequestSchema(schemaJson, path, method);
        var reqBodySchema = resolveSchemaRef(schemaJson, reqBodySchemaData.requestBody.$ref);
        
        //var reqBodySchemaData = getSubSchemaYaml(path, method, api_response.schema.schema, "request")
        
        
        const bodyValid = validate(pm.response.json(), resBodySchemaData.subSchema);
        if(reqBodySchemaData.ref !== 'No Ref' && config.validate.requestBody) {
            pm.test('Validating request body against ' + reqBodySchemaData.ref + ' schema from the ' + api + ' OpenAPI', function() {
                const reqValid = validate(JSON.parse(pm.request.body.raw), reqBodySchemaData.subSchema);
                pm.expect(reqValid).to.be.true;
            });
        }
        else {
                pm.test(config.validate.requestBody ? 'No request body for path ' + path +  'from the ' + api + ' OpenAPI' : 'Skipping Request Body tests', function() {
                pm.expect(true).to.be.true;
            });
        }
        if(resBodySchemaData.ref !== 'No Ref' && config.validate.responseBody) {
            pm.test('Validating response body against ' + resBodySchemaData.ref + ' schema from the ' + api + ' OpenAPI', function() {
                
                pm.expect(bodyValid).to.be.true;
            });
        }
        else {
                pm.test(config.validate.responseBody ? 'No request body for path ' + path +  'from the ' + api + ' OpenAPI' : 'Skipping Response Body tests', function() {
                pm.expect(true).to.be.true;
            });
        }
        
    }    

});