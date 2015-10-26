describe('fc.util.extent', function () {

    function obj(val) {
        return {
            high: val + 5,
            low: val - 5
        };
    }

    it('should compute extents based on the supplied fields', function () {
        var data = [obj(1), obj(2), obj(10)];

        var extents = fc.util.extent()(data, ['high']);
        expect(extents).toEqual([6, 15]);

        extents = fc.util.extent()(data, ['high', 'low']);
        expect(extents).toEqual([-4, 15]);
    });

    it('should support a single field name', function () {
        var data = [obj(1), obj(2), obj(10)];

        var extents = fc.util.extent()(data, 'high');
        expect(extents).toEqual([6, 15]);
    });

    it('should support arrays of arrays', function () {
        var data = [obj(2), obj(1)];
        var data2 = [obj(4), obj(5)];

        var extents = fc.util.extent()([data, data2], 'high');
        expect(extents).toEqual([6, 10]);
    });

    it('should support accessor functions', function () {
        var data = [obj(1), obj(2), obj(10)];

        var extents = fc.util.extent()(data, [function (d) { return d.high + 100; }]);
        expect(extents).toEqual([106, 115]);
    });

    it('should support varargs field names', function () {
        var data = [obj(1), obj(2), obj(10)];

        var extents = fc.util.extent()(data, 'low', 'high');
        expect(extents).toEqual([-4, 15]);
    });

    it('should support mixed field names and accessor functions', function () {
        var data = [obj(1), obj(2), obj(10)];

        var extents = fc.util.extent()(data, 'high', function (d) { return d.high + 100; });
        expect(extents).toEqual([6, 115]);
    });

    it('should support including a max value in the range', function () {
        var data = [obj(1), obj(2)];

        var extents = fc.util.extent()
            .include(10)(data, 'high');
        expect(extents).toEqual([6, 10]);
    });

    it('should support including a min value in the range', function () {
        var data = [obj(1), obj(2)];

        var extents = fc.util.extent()
            .include(0)(data, 'high');
        expect(extents).toEqual([0, 7]);
    });

    it('should support including a value within the range', function () {
        var data = [obj(1), obj(3)];

        var extents = fc.util.extent()
            .include(7)(data, 'high');
        expect(extents).toEqual([6, 8]);
    });

    it('should support increasing the range', function () {
        var data = [obj(5), obj(15)];

        var extents = fc.util.extent()
            .pad(1)(data, 'high');
        expect(extents).toEqual([5, 25]);
    });

    it('should support padding an empty dataset', function () {
        var data = [];

        var extents = fc.util.extent()
            .pad(2)(data, 'high');
        expect(isNaN(extents[0])).toBe(true);
        expect(isNaN(extents[1])).toBe(true);
    });

    it('should support padding zero as an identity', function () {
        var data = [obj(1), obj(2)];

        var extents = fc.util.extent()
            .pad(0)(data, 'high');
        expect(extents).toEqual([6, 7]);
    });

    it('should pad the range, then include the extra point', function () {
        var data = [obj(5), obj(15)];

        var extents = fc.util.extent()
            .include(0)
            .pad(1)(data, 'high');
        expect(extents).toEqual([0, 25]);

        extents = fc.util.extent()
            .include(30)
            .pad(1)(data, 'high');
        expect(extents).toEqual([5, 30]);
    });

    it('should pad dates', function () {
        var date1 = new Date(2014, 0, 10);
        var date2 = new Date(2014, 0, 20);
        var data = [{date: date1}, {date: date2}];

        var extents = fc.util.extent()
            .pad(1)(data, 'date');
        expect(extents).toEqual([new Date(2014, 0, 5), new Date(2014, 0, 25)]);
    });

});
