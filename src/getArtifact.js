const fs = require('fs');

function requireFromString(src, filename) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(src, filename);
    return m.exports;
  }
  
  var ghci =  {};
  ghci.slug = 'bidnessforb/bian-validation'
  ,ghci.path = "src/scripts/request/pre-request.js"
  ,ghci.ref = null
  ,ghci.target = 'varTEST';

  console.log(JSON.stringify(ghci));

  
  
  var script = fs.readFileSync('/Users/bryancross/dev/github/bidnessforb/bian-validation/src/getGithubFile.js', 'utf8');
  const func = requireFromString(script, "foo.js");
  var testscript = func.getGitHubArtifact(ghci);
  
  console.log(testscript);
  //func("bidnessforb/bian-validation", 
