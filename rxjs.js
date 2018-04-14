const {
    AnonymousObservable,
    Observer
} = require("rx");
const {
    isReduced
} = require("./reduce.js");


function TransduceObserver(o, xform) {
    this.o = o;
    this.xform = xform;
    this.stoped = false;
    Observer.call(this);
}

TransduceObserver.prototype = Object.create(Observer.prototype);
TransduceObserver.prototype.onNext = function(value) {
    if (!this.isStopped) {
        this.next(value);
    }
};

TransduceObserver.prototype.onError = function(error) {
    if (!this.isStopped) {
        this.isStopped = true;
        this.error(error);
    }
};

TransduceObserver.prototype.onCompleted = function() {
    if (!this.isStopped) {
        this.isStopped = true;
        this.completed();
    }
};

TransduceObserver.prototype.dispose = function() {
    this.isStopped = true;
};

TransduceObserver.prototype.fail = function(e) {
    if (!this.isStopped) {
        this.isStopped = true;
        this.error(e);
        return true;
    }

    return false;
};

TransduceObserver.prototype.next = function(value) {
    try {
        var item = this.xform(this.o, value);
        if (isReduced(item)) {
            this.stoped = true;
            this.onCompleted();
        }
    } catch (e) {
        this.stoped = true;
        this.o.onError(e);
    }
};
TransduceObserver.prototype.error = function(e) {
    this.o.onError(e);
};
TransduceObserver.prototype.completed = function() {
    this.xform(this.o);
};



function transformFromObservable(observable) {
    return function(ob, item) {
        switch (arguments.length) {
            case 0:
                return observable;
            case 1:
                {
                    ob.completed();
                    return ob;
                }
            default:
                {
                    ob.onNext(item);
                    return ob;
                }
        }
    };
}

function with_observable(xform, source) {
    return new AnonymousObservable(function(o) {
        var transform = xform(transformFromObservable(o));
        return source.subscribe(new TransduceObserver(o, transform));
    }, source);
}

module.exports = {
    withObservable: with_observable
};
