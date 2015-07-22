"use strict";

describe("ajax-best-promise fromElements", function() {
    var fromElements = AjaxBestPromise.fromElements;

    beforeEach(function() {
        var fixture = '<div id=fixture><input id="param1" value="one">' + 
          '<input id="param2" value="two"></div>';

        document.body.insertAdjacentHTML(
          'afterbegin', 
          fixture);
    });
  
    afterEach(function() {
        document.body.removeChild(document.getElementById('fixture'));
    });
    
    it("get input values", function() {
        expect(fromElements).to.be.ok();
        expect(fromElements).to.be.a(Function);
        expect(fromElements(['param1', 'param2'])).to.eql({param1:'one', param2:'two'});
    });

});