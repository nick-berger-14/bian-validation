

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
    
validate  = function (data, schema) {
        var Ajv = require('ajv');
        ajv = new Ajv({logger: console});
        if(config.setAllPropertiesRequired)
          schema = requireAll(schema);
        const validate = ajv.compile(schema);
        const valid = validate(data);
        return valid;
    };
    
resolveSchemaRef = function (apischema, ref) {
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
    
getRequestSchema = function (apischema, requestPath, method) {
      return apischema.paths[requestPath][method];
    }
    
getResponseSchema = function (apischema, requestPath, method, status, contentType) {
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
    
    
getSubSchemaYaml = function (schemapath, method, schemaYaml, type) {
        
        var schemaJson = jsyaml.load(schemaYaml);
        return getSubSchemaJson(schemapath, method, schemaJson, type);
    };
    