"use strict";

describe("ajax-best-promise", function() {
    var fromElements = AjaxBestPromise.fromElements;
    describe('fromElements',function(){
        beforeEach(function() {
            var fixture = '<div id=fixture><input id="param1" value="one">' + 
              '<input id="param2" value="two">'+
              '<span id=elementWithNoValue>The span text</span>'+
              '</div>';
            document.body.insertAdjacentHTML('afterbegin', fixture);
        });
      
        afterEach(function() {
            var fixtureElement=document.getElementById('fixture');
            if(fixtureElement){
                document.body.removeChild(fixtureElement);
            }
        });
        
        it("get input values  fromElements", function() {
            expect(fromElements).to.be.ok();
            expect(fromElements).to.be.a(Function);
            expect(fromElements([
                'param1', document.getElementById('param2'),
                'elementWithNoValue',
            ])).to.eql({
                param1:'one', 
                param2:'two',
                elementWithNoValue:'The span text',
            });
        });
        
        it("complete path fromElements", function() {
            expect(AjaxBestPromise.completePath([
                'param1', document.getElementById('param2'),
                'elementWithNoValue',
            ])).to.eql('one/two/The%20span%20text');
        });

        it("control parameters for fromElements", function() {
            try{
                fromElements(['inexistent']);
                throw new Error('must throw a error because inexistente parameter');
            }catch(err){
                expect(err.message).to.match(/AjaxBestPromise.fromElements must receive a list of elements/);
            }
        });
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

    it("post utf8 message", function(done){
        AjaxBestPromise.post({
            url:'http://localhost:12448/ejemplo/post/upper',
            data:{text:'¡águila, pingüino, tatú!'}
        }).then(function(result){
            expect(result).to.be('¡ÁGUILA, PINGÜINO, TATÚ!');
            done();
        }).catch(done);
    });

    it("receive status 400", function(done){
        AjaxBestPromise.get({
            url:'http://localhost:12448/ejemplo/error',
            data:{p_valor_malo:'¡ágape<b>c&d; drop table!'}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            expect(err.message).to.match(/400 .*¡ágape<b>c&d; drop table!/);
            done();
        }).catch(done);
    });

    it("receive status 404 not found", function(done){
        AjaxBestPromise.get({
            url:'http://localhost:12448/ejemplo/inexistente',
            data:{a: 101}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            if(!window.chrome && !navigator.mozApps){
                expect(err.message).to.match(/404 Cannot GET \/ejemplo\/inexistente\?a=101/);
            }
            done();
        }).catch(done);
    });
    
    it("receive chunked data", function(done){
        var expected=/line 1\n-?line 2 es primo!\n-line 3 es primo!\n/;
        var obtained=[];
        AjaxBestPromise.get({
            url:'http://localhost:12448/ejemplo/flujo',
            data:{limite:3, delay:200}
        }).onChunk(function(chunk){
            obtained.push(chunk);
        }).then(function(result){
            expect(obtained.join('-')).to.match(expected);
            done();
        }).catch(done);
    });

    it("error in a chunked post", function(done){
        AjaxBestPromise.post({
            url:'http://localhost:12448/ejemplo/error',
            data:{p_valor_malo:'¡ágape<b>c&d; drop table!'}
        }).onChunk(function(chunk){
            done(new Error('does not expect a chunk result: '+chunk));
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            expect(err.message).to.match(/404 Cannot POST \/ejemplo\/error/);
            done();
        }).catch(done);
    });

    it("catchs error directly in a chunked post", function(done){
        AjaxBestPromise.post({
            url:'http://localhost:12448/ejemplo/error',
            data:{p_valor_malo:'¡ágape<b>c&d; drop table!'}
        }).catch(function(err){
            expect(err.message).to.match(/404 Cannot POST \/ejemplo\/error/);
            done();
        }).catch(done);
    });
    
    it("receive line stream", function(done){
        var emmited =[['∞'],{alpha:'α', beta:'β', gamma:'γ'}, false, null, "¡águila!", "last"];
        var expected=['"one"\n','2\r','3\r\n'].concat(emmited.map(function(o){ 
            return JSON.stringify(o)+(o==='last'?'':'\n');
        }));
        var obtained=[];
        AjaxBestPromise.get({
            url:'http://localhost:12448/ejemplo/json-stream',
            data:{
                data:JSON.stringify(emmited),
                delay:150
            }
        }).onLine(function(line){
            obtained.push(line);
        }).then(function(result){
            expect(obtained).to.eql(expected);
            done();
        }).catch(done);
    });
    
    it("receive json stream", function(done){
        var expected=["one",2,3,['∞'],{alpha:'α', beta:'β', gamma:'γ'}, "¡águila!"];
        var obtained=[];
        AjaxBestPromise.get({
            url:'http://localhost:12448/ejemplo/json-stream',
            data:{
                data:JSON.stringify(expected.slice(3)),
                delay:150
            }
        }).onJson(function(json){
            obtained.push(json);
        }).then(function(result){
            expect(obtained).to.eql(expected);
            done();
        }).catch(done);
    });
});