const {
  transduce, completing
} = require("./transducers.js");

const INJEST_METHOD = "@@com.boogie666.tranducers.util/injest";

function injest_method(o){
  return o[INJEST_METHOD];
}

function can_injest(o){
  return !!injest_method(o);
}

function injest(xs, item){
  if(can_injest(xs)){
    return injest_method(xs).call(xs, item);
  }
  throw xs + " can't injest " + item;
}

function add_injest_method(proto, fn){
  proto[INJEST_METHOD] = fn;
}


function into(to, xform, from){
  return transduce(xform, completing(injest), to, from);
}


module.exports = {
  into : into,
  injest : injest,
  addInjestMethod : add_injest_method
};
