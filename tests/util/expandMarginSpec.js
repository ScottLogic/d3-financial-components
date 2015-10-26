describe('fc.util.expandMargin', function () {

    it('should expand integers', function () {
        var margin = fc.util.expandMargin(10);

        expect(margin).toEqual({
            top: 10,
            bottom: 10,
            right: 10,
            left: 10
        });
    });

    it('should fill missing properties', function () {
        var margin = fc.util.expandMargin({
            top: 10
        });

        expect(margin).toEqual({
            top: 10,
            bottom: 0,
            right: 0,
            left: 0
        });
    });

    it('should not alter already complete margins', function () {
        var margin = fc.util.expandMargin({
            top: 1,
            bottom: 2,
            right: 3,
            left: 4
        });

        expect(margin).toEqual({
            top: 1,
            bottom: 2,
            right: 3,
            left: 4
        });
    });
});
