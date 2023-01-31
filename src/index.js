const fs = require('fs');
const Ajv = require('ajv');



  

var item = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/generated-schema.json', 'utf8'));

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
    newSchema.properties = schema.schema.properties;
    //schema.schema.required = Object.keys(schema.schema.properties);
    newSchema.required = Object.keys(schema.schema.properties);
    newSchema.additionalProperties = false;
    //schema.schema.properties.PaymentInitiationTransaction.required = Object.keys(schema.schema.properties.PaymentInitiationTransaction.properties);
    newSchema.properties.PaymentInitiationTransaction.required = Object.keys(schema.schema.properties.PaymentInitiationTransaction.properties);
    newSchema.properties.PaymentInitiationTransaction.additionalProperties = false;
    return newSchema
  }

  var data = JSON.parse(fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/resources/PaymentInitiationTransaction-bad.json', 'utf8'));

  
        const ajv = new Ajv();
        item = requireAll(item);
        console.log(JSON.stringify(item));
        const validate = ajv.compile(item);
        const valid = validate(data);
        

  
  console.log(valid);



