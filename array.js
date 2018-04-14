const {
  addSelfReduceMethod, isReduced
} = require("./reduce.js");

const {
  addInjestMethod
} = require("./into.js");


addSelfReduceMethod(Array.prototype, function(f, init){
  if(isReduced(init)){
      return init.value;
    }
    for(var i = 0; i < this.length; i++){
      init = f(init, this[i]);
      if(isReduced(init)){
        return init.value;
      }
    }
  return init;
});


addInjestMethod(Array.prototype, function(item){
  this.push(item);
  return this;
});

