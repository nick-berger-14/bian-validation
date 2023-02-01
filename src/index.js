const fs = require('fs');
const Ajv = require('ajv');
const { json } = require('stream/consumers');



  


  
  function requireAll (schema) {
    var newSchema = {};
    newSchema.type = schema.type;
    newSchema.properties = schema.properties;
    //schema.schema.required = Object.keys(schema.schema.properties);
    newSchema.required = Object.keys(schema.properties);
    newSchema.additionalProperties = false;
    //schema.schema.properties.PaymentInitiationTransaction.required = Object.keys(schema.schema.properties.PaymentInitiationTransaction.properties);
    if(status == 200) {
      newSchema.properties.PaymentInitiationTransaction.required = Object.keys(schema.properties.PaymentInitiationTransaction.properties);
      newSchema.properties.PaymentInitiationTransaction.additionalProperties = false;
    }
    
    return newSchema
  }

  function validate(data, schema) {
        const ajv = new Ajv();
        schema = requireAll(schema);
        const validate = ajv.compile(schema);
        const valid = validate(data);
        return valid;
  }

  function getSubSchemaYaml(schemapath, method, schemaYaml, subComponent) {
    const yaml =  require('js-yaml');
    //const yaml =  require('js_yaml'); //underscore required in Postman
    //(new Function(yaml))();
    //return getSubSchemaJson(jsyaml.load(api_response.schema.schema));
    return getSubSchemaJson(schemapath, method, yaml.load(schemaYaml),subComponent);
  }

  function getSubSchemaJson(path, method, schema, subComponent) {
    var subComponent = subComponent === 'request' ? 'requestBody' : 'responses';
    var subRef = subComponent === 'requestBody' ?'requestBodies' :'responses'; 
    var elem;
    if(subComponent === 'responses') {
      elem = schema.paths[path][method][subComponent][status]['$ref']; //same place for 200 and <> 200
    }
    else {
      elem = schema.paths[path][method][subComponent]['$ref'];
    }
    
    elem = elem.split('\/')[(elem.split('\/').length) - 1]
    var elemRef = schema.components[subRef][elem].content['application/json'].schema['$ref'];
    if(status != 200) {
      elemRef = elemRef.split('\/')[(elemRef.split('\/').length) - 1] //works for req and res 200
    }
    else {
      elemRef = elem.split('\/')[(elem.split('\/').length) - 1] //works for req and res 200
    }
    
    return schema.components.schemas[elemRef];

    schema.components.responses.Unauthorized.content['application/json'].schema.$ref
    /*
    var elem = schema.paths[path][method].requestBody['$ref'];
    elem = elem.replace('#/components/requestBodies/','');
    var elemRef = schema.components.requestBodies[elem].content['application/json'].schema['$ref'];
    elemRef = elemRef.replace('#/components/schemas/', '');
    return schema.components.schemas[elemRef];
    */
  }

var schema = fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/postman/PaymentInitiation-schema.yaml', 'utf8');
var status = 401;

var resData = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/response-bodies/err-body.json', 'utf8'));
//var data = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/request-bodies/PaymentInitiationTransaction-Request-body-bad.json', 'utf8'));
var reqData = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/request-bodies/PaymentInitiationTransaction-Request-body-good.json', 'utf8'));


var method = 'post'
var path = '/PaymentInitiation/Initiate';

var reqItem = getSubSchemaYaml(path, 'post',schema, 'request');
var resItem = getSubSchemaYaml(path, 'post', schema, 'response');
//console.log(JSON.stringify(data));

var valid = validate(reqData, reqItem);
console.log("VALID: " + valid);
valid = validate(resData, resItem);

  //var data = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/response-bodies/PaymentInitiationTransaction-good.json', 'utf8'));
  //valid = validate(data, item);
  //console.log('-good body is valid?: ' + valid);
  /*
        const ajv = new Ajv();
        item = requireAll(item);
        console.log(JSON.stringify(item));
        const validate = ajv.compile(item);
        const valid = validate(data);
        */


  
  



