const {
    addSelfReduceMethod,
    isReduced
} = require("./reduce.js");

const {
    Collection,
    List,
    Stack,
    Set,
    Seq,
    Map
} = require("immutable");

const {
    addInjestMethod
} = require("./into.js");

function self_reduce(f, init) {
    if (isReduced(init)) {
        return init.value;
    }
    this.forEach(function(item) {
        init = f(init, item);
        if (isReduced(init)) {
            init = init.value;
            return false;
        }
        return true;
    });
    return init;
}

function self_reduce_seq(f, init) {
    if (isReduced(init)) {
        return init.value;
    }
    var list = this;

    for (var first = list.first(); list; list = list.rest(), first = list.first()) {
        init = f(init, first);
        if (isReduced(init)) {
            return init.value;
        }
    }

    return init;
}

addSelfReduceMethod(Collection.prototype, self_reduce);
addSelfReduceMethod(Seq.prototype, self_reduce_seq);

addInjestMethod(List.prototype, List.prototype.push);
addInjestMethod(Set.prototype, Set.prototype.add);
addInjestMethod(Stack.prototype, Stack.prototype.push);
addInjestMethod(Map.prototype, function(pair) {
    if (pair.length !== 2) {
        throw new Error("Maps must injest a pair of key and value");
    }
    return this.set(pair[0], pair[1]);
});
