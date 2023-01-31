const fs = require('fs');
const Ajv = require('ajv');



  

var item = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/postman/PaymentInitiationTransaction-object-schema.json', 'utf8'));

/*
  const fastifyRouteConfig = {
    schema: {
      body: requireAll(schema)
    }
    
    
  }
  */
  
  function requireAll (schema) {
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
  }

  function validate(data, schema) {
        const ajv = new Ajv();
        schema = requireAll(schema);
        const validate = ajv.compile(schema);
        const valid = validate(data);
        return valid;
  }
  
  var data = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/response-bodies/PaymentInitiationTransaction-bad.json', 'utf8'));
  valid = validate(data, item);
  console.log('-bad body is valid?: ' + valid);


  var data = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/response-bodies/PaymentInitiationTransaction-good.json', 'utf8'));
  valid = validate(data, item);
  console.log('-good body is valid?: ' + valid);
  /*
        const ajv = new Ajv();
        item = requireAll(item);
        console.log(JSON.stringify(item));
        const validate = ajv.compile(item);
        const valid = validate(data);
        */


  
  



