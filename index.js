require("./array.js");
require("./immutable.js");
const { List, Set } = require("immutable");
const {withObservable} = require("./rxjs.js");
const {
    map,
    cat,
    filter,
    completing,
    take,
    transduce,
    partitionAll,
    takeWhile,
    dropWhile,
    dedupe,
    distinct,
    interpose,
    takeNth,
    drop,
    comp
} = require("./transducers.js");
const {
    into
} = require("./into.js");


const {
    Observable
} = require("rx");


const process = comp(takeNth(3));

/*
console.log("list -> list", into(List(), process, List([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])));
console.log("array -> list", into(List(), process, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
console.log("list -> array", into([], process, List([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])));
console.log("set -> List", into(Set(), process, List([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])));

withObservable(process, Observable.from([0,1,2,3,4,5,6,7,8,9])).subscribe(value => {
console.log("obervable", value);
});

*/

console.log("array -> array", into([], process, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));

