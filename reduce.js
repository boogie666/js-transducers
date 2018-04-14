function Reduced(val) {
    this.value = val;
}

function reduced(x) {
    return new Reduced(x);
}

function is_reduced(x) {
    return x instanceof Reduced;
}

const SELF_REDUCE_METHOD = "@@com.boogie666.transducers/self_reduce";

function reduce_method(o) {
    return o[SELF_REDUCE_METHOD];
}

function can_self_reduce(xs) {
    return !!reduce_method(xs);
}

function add_self_reduce_method(proto, fn) {
    proto[SELF_REDUCE_METHOD] = fn;
}


function reduce(f, init, xs) {
    if (can_self_reduce(xs)) {
        return reduce_method(xs).call(xs, f, init);
    }
    throw "Can't reduce " + xs;
}

module.exports = {
    reduced: reduced,
    reduce: reduce,
    isReduced: is_reduced,
    addSelfReduceMethod: add_self_reduce_method
};
