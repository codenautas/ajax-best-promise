"use strict";

describe("ajax-best-promise", function() {
    var fromElements = AjaxBestPromise.fromElements;

    beforeEach(function() {
    });
  
    afterEach(function() {
        var fixtureElement=document.getElementById('fixture');
        if(fixtureElement){
            document.body.removeChild(fixtureElement);
        }
    });
    
    it("get input values  fromElements", function() {
        var fixture = '<div id=fixture><input id="param1" value="one">' + 
          '<input id="param2" value="two"></div>';
        document.body.insertAdjacentHTML('afterbegin', fixture);

        expect(fromElements).to.be.ok();
        expect(fromElements).to.be.a(Function);
        expect(fromElements(['param1', 'param2'])).to.eql({param1:'one', param2:'two'});
    });

    it("send and receive normal message with ajax", function(done){
        expect(XMLHttpRequest.toString()).to.match(/\[object XMLHttpRequestConstructor\]|function XMLHttpRequest\(\)[\s|\n]*{[\s|\n]*\[native code\][\s|\n]*}/);
        var ajax = new XMLHttpRequest();
        ajax.open('GET', 'http://localhost:12448/ejemplo/suma?p1=7&p2=8');
        ajax.setRequestHeader('X-Requested-With','XMLHttpRequest');
        ajax.onload=function(e){
            if(ajax.status!=200){
                done(new Error("bad status "+ajax.status));
            }else{
                try{
                    expect(ajax.responseText).to.eql(15);
                    done();
                }catch(err){
                    done(err);
                };
            }
        };
        ajax.onerror=function(err){
            if(!(err instanceof Error)){
                err = new Error('boxed ERR:'+err+' '+JSON.stringify(err));
            }
            done(err);
        }
        ajax.send();
    });
    
    it("send and receive normal message", function(done){
        AjaxBestPromise.get({
            url:'http://localhost:12448/ejemplo/suma',
            data:{p1:7, p2:8}
        }).then(function(result){
            expect(result).to.be('15');
            done();
        }).catch(done);
    });
});