import d3 from 'd3';
import { noop, identity } from '../../util/fn';

// applies an algorithm to an array and merges the result using the given merge function.
export default function() {

    var merge = noop,
        algorithm = identity;

    var mergeCompute = function(data) {
        return d3.zip(data, algorithm(data))
            .map(function(tuple) {
                return merge(tuple[0], tuple[1]);
            });
    };

    mergeCompute.algorithm = function(x) {
        if (!arguments.length) {
            return algorithm;
        }
        algorithm = x;
        return mergeCompute;
    };

    mergeCompute.merge = function(x) {
        if (!arguments.length) {
            return merge;
        }
        merge = x;
        return mergeCompute;
    };

    return mergeCompute;
}
