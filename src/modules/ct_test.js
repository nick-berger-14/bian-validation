
var ctutil = {};


ctutil.setPMRequest = function(obj) {
    this.Request = obj;
};

//Mutate the schema to require all properties, custom for each ref :(
ctutil.requireAll = function (schema) {
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
    
ctutil.validate  = function (data, schema) {
        var Ajv = require('ajv');
        ajv = new Ajv({logger: console});
        if(config.setAllPropertiesRequired)
          schema = requireAll(schema);
        const validate = ajv.compile(schema);
        const valid = validate(data);
        return valid;
    };
    
ctutil.resolveSchemaRef = function (apischema, ref) {
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
    
ctutil.getRequestSchema = function (apischema, requestPath, method) {
      return apischema.paths[requestPath][method];
    }
    
ctutil.getResponseSchema = function (apischema, requestPath, method, status, contentType) {
      contentType = 'application/json'; //hard coded for now till we figure out how to get it out of the headers.
      var respSchema = apischema.paths[requestPath][method].responses[status];
      var respObj;
      if(respSchema === undefined || respSchema === null) {
          return null;
      }
      if(respSchema.$ref !== undefined) {
          respObj = this.resolveSchemaRef(apischema, respSchema.$ref);
          if(respObj.content[contentType].schema.$ref !== undefined) {
              respSchema = this.resolveSchemaRef(apischema, respObj.content[contentType].schema.$ref);
              schemaData = {};
              schemaData.subSchema = respSchema;
              schemaData.ref = respObj.content[contentType].schema.$ref;
              return schemaData;
          }
      }
      return new Object();
    
    }
    
    
ctutil.getSubSchemaYaml = function (schemapath, method, schemaYaml, type) {
        
        var schemaJson = jsyaml.load(schemaYaml);
        return getSubSchemaJson(schemapath, method, schemaJson, type);
    };

ctutil.validatePropertyList =  function (apischema, reqSchema, reqJson) {
        var paramSchema;
        
        var request = new this.Request(reqJson);
        
        var curSchemaParam;
        var validationResults = [];
        var curValidationMessage
        var reqVarsToSearch;
        
        
        for(i = 0 ; i < reqSchema.parameters.length; i++)
        {
            curSchemaParam = reqSchema.parameters[i];
            //is it a ref?
            if('$ref' in curSchemaParam) {
                //resolve the ref
                curSchemaParam = this.resolveSchemaRef(apischema, curSchemaParam.$ref);
            }
            switch (curSchemaParam.in) {
                case 'path':
                    {
                        reqVarsToSearch = request.url.variables.toObject(null,null,null,null);
                        break;
                    }
                case 'query':
                    {
                        reqVarsToSearch = request.url.query.toObject(null,null,null,null);
                        break;
                    }
                case 'header':
                    {
                        reqVarsToSearch = request.headers.toObject(null,null,null,null);
                        break;
                    }
                case 'cookie':
                    {
                        //Not implemented
                        return new Object();
                    }
                
            }
            //Path or query variable?
            
            curValidationMessage = new Object();
    
            //If the variable is required and missing, create a validation message and add it to the results array
            if(curSchemaParam.required && (reqVarsToSearch[curSchemaParam.name] === null || reqVarsToSearch[curSchemaParam.name] === undefined )){
                curValidationMessage.param = curSchemaParam.name;
                curValidationMessage.message = "Required " + curSchemaParam.in.toUpperCase() + " parameter [" + curSchemaParam.name +"] missing";
                validationResults.push(curValidationMessage);
            }
            //If the variable is present and there is a type defined in the schema....
            else if(curSchemaParam.schema.type !== undefined) 
            {
                //If the type is integer, verify that the value in the request is an integer.  
                if((curSchemaParam.schema.type === 'integer') && Number.isNaN(parseInt(reqVarsToSearch[curSchemaParam.name]))) {
                    curValidationMessage.param = curSchemaParam.name;
                    curValidationMessage.message = curSchemaParam.in.toUpperCase() + " param [" + curSchemaParam.name +"] value [" + reqVarsToSearch[curSchemaParam.name] + "] is invalid for schema type: " + curSchemaParam.schema.type;
                    validationResults.push(curValidationMessage);
                }
                delete reqVarsToSearch[curSchemaParam.name];
            }
    
        }
        
    
        return validationResults;
        
    }

    module.exports = ctutil;
    
    
    