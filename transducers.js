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

function comp(...fns) {
    return function(x) {
        for (var i = fns.length - 1; i >= 0; i--) {
            x = fns[i](x);
        }
        return x;
    };
}

function transduce(xform, reducer, init, xs) {
    var xf = xform(reducer);
    var result = reduce(xf, init, xs);
    return xf(result);
}

function completing(fn) {
    return function(a, b) {
        switch (arguments.length) {
            case 0:
                return fn();
            case 1:
                return a;
            default:
                return fn(a, b);
        }
    };
}

function preserving_reduced(rf) {
    return function(a, b) {
        var result = rf(a, b);
        if (is_reduced(result)) {
            return reduced(result);
        }
        return result;
    };
}

function cat(rf) {
    const rrf = preserving_reduced(rf);
    return function(acc, item) {
        switch (arguments.length) {
            case 0:
                return rf();
            case 1:
                return rf(acc);
            default:
                return reduce(rrf, acc, item);
        }
    };
}

function map(f) {
    return function(xf) {
        return function(acc, item) {
            switch (arguments.length) {
                case 0:
                    return xf();
                case 1:
                    return xf(acc);
                default:
                    return xf(acc, f(item));
            }
        };
    };
}

function take(n) {
    return function(xf) {
        var count = 0;
        return function(acc, item) {
            switch (arguments.length) {
                case 0:
                    return xf();
                case 1:
                    return xf(acc);
                default:
                    if (count === n) {
                        return reduced(acc);
                    }
                    count++;
                    return xf(acc, item);
            }
        };
    };
}

function drop(n) {
    return function(xf) {
        var count = n;
        return function(acc, item) {
            switch (arguments.length) {
                case 0:
                    return xf();
                case 1:
                    return xf(acc);
                default:
                    if (count > 0) {
                        count--;
                        return acc;
                    }
                    return xf(acc, item);
            }
        };
    };
}

function mapcat(f) {
    return comp(map(f), cat);
};

function filter(pred) {
    return function(xf) {
        return function(acc, item) {
            switch (arguments.length) {
                case 0:
                    return xf();
                case 1:
                    return xf(acc);
                default:
                    if (pred(item)) {
                        return xf(acc, item);
                    }
                    return acc;
            }
        };
    };
}

function keep(pred) {
    return filter(function(item) {
        return pred(item) != null;
    });
}


function remove(pred) {
    return filter(function(item) {
        return !pred(item);
    });
}




function unreduced(possible_reduced) {
    if (is_reduced(possible_reduced)) {
        return possible_reduced.value;
    }
    return possible_reduced;
}

function partition_all(count) {
    return function(rf) {
        let partitions = [];
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    if (partitions.length > 0) {
                        result = unreduced(rf(result, partitions));
                        partitions = [];
                    }
                    return rf(result);
                default:
                    partitions.push(item);
                    if (partitions.length === count) {
                        result = rf(result, partitions);
                        partitions = [];
                    }
                    return result;
            }
        };
    };
}


function take_while(pred) {
    return function(rf) {
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    return rf(result);
                default:
                    if (!pred(item)) {
                        return reduced(result);
                    } else {
                        return rf(result, item);
                    }
            }
        };
    };
}

function drop_while(pred) {
    return function(rf) {
        let done_droping = false;
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    return rf(result);
                default:
                    if (done_droping || !pred(item)) {
                        done_droping = true;
                        return rf(result, item);
                    }
                    return result;
            }
        };
    };
}


function random_sample(prob) {
    return filter(function(_) {
        return Math.random() < prob;
    });
}

function triple_eq(a, b) {
    return a === b;
}

function dedupe(eqFn) {
    eqFn = eqFn || triple_eq;
    return function(rf) {
        let previous_value = null;
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    return rf(result);
                default:
                    if (previous_value == null || !eqFn(previous_value, item)) {
                        result = rf(result, item);
                    }
                    previous_value = item;
                    return result;
            }
        };
    };
}

function distinct(eqFn) {
    eqFn = eqFn || triple_eq;
    return function(rf) {
        let seen_so_far = [];
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    seen_so_far = [];
                    return rf(result);

                default:
                    if (!seen_so_far.find(i => eqFn(i, item))) {
                        seen_so_far.push(item);
                        result = rf(result, item);
                    }
                    return result;
            }
        };
    };
}


function interpose(separator) {
    return function(rf) {
        let started = false;
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    return rf(result);
                default:
                    if (started) {
                        result = rf(result, separator);
                        if (is_reduced(result)) {
                            return result;
                        }
                        return rf(result, item);
                    }
                    started = true;
                    return rf(result, item);
            }
        };
    };
}



function map_indexed(f) {
    return function(rf) {
        let index = 0;
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    return rf(result);
                default:
                    return rf(result, f(index++, item));
            }
        };
    };
}

function filter_indexed(pred) {
    return function(rf) {
        let index = 0;
        return function(result, item) {
            switch (arguments.length) {
                case 0:
                    return rf();
                case 1:
                    return rf(result);
                default:
                    if (pred(index++, result)) {
                        result = rf(result, item);
                    }
                    return result;
            }
        };
    };
}

function keep_indexed(pred) {
    return filter_indexed(function(idx, item) {
        return pred(idx, item) != null;
    });
}

function remove_indexed(pred) {
    return filter_indexed(function(idx, item) {
        return !pred(idx, item);
    });
}

/*
take-nth
partition-by
halt-when
*/



module.exports = {
    map: map,
    filter: filter,
    keep: keep,
    drop: drop,
    take: take,
    comp: comp,
    cat: cat,
    mapcat: mapcat,
    mapIndexed: map_indexed,
    keepIndexed: keep_indexed,
    filterIndexed: filter_indexed,
    partitionAll: partition_all,
    takeWhile: take_while,
    dropWhile: drop_while,
    randomSample: random_sample,
    dedupe: dedupe,
    distinct: distinct,
    interpose: interpose,
    remove: remove,
    removeIndexed : remove_indexed,

    unreduced: unreduced,
    transduce: transduce,
    reduced: reduced,
    isReduced: is_reduced,
    addSelfReduceMethod: add_self_reduce_method,
    completing: completing
};
