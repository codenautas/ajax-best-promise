"use strict";

var agentInfo=new UserAgent().parse(window.navigator.userAgent);

function newFile(parts, name, type){
    try{
        return new File(parts, name, type);
    }catch(err){
        if(err.message.match(/is not a constructor|Object doesn't support this action/)){
            var rta = new Blob(parts, type||{});
            try{
                rta.name=name;
                rta.lastModifiedDate = new Date();
            }catch(err2){
            }
            return rta;
        }
        throw err;
    }
}

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
        expect(XMLHttpRequest.toString()).to.match(/\[object XMLHttpRequest(Constructor)?\]|function XMLHttpRequest\(\)[\s|\n]*{[\s|\n]*\[native code\][\s|\n]*}/);
        var ajax;
        if (window.ActiveXObject) {
            try {
                ajax = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                ajax = new ActiveXObject("Microsoft.XMLHTTP");
            }                
        }else{
            ajax = new XMLHttpRequest();
        }
        ajax.open('GET', 'http://'+location.hostname+':12448/ejemplo/suma?p1=7&p2=8');
        ajax.setRequestHeader('X-Requested-With','XMLHttpRequest');
        ajax.onreadystatechange=function(e){
            if(ajax.readyState == 4){
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
            }
        }
        ajax.send();
    });
    
    it("send and receive normal message", function(done){
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/suma',
            data:{p1:7, p2:8}
        }).then(function(result){
            expect(result).to.be('15');
            done();
        }).catch(done);
    });

    it("post utf8 message", function(done){
        AjaxBestPromise.post({
            url:'http://'+location.hostname+':12448/ejemplo/post/upper',
            data:{text:'¡águila, pingüino, tatú!\n\n\n123 ERROR lower: UPPER'}
        }).then(function(result){
            expect(result).to.be('¡ÁGUILA, PINGÜINO, TATÚ!\n\n\n123 ERROR LOWER: UPPER');
            done();
        }).catch(done);
    });

    if(agentInfo.browser=='Safari' && agentInfo.version.match(/^5/)){
        it("post file");
        it("post 3 files");
    }else{
        it("post file", function(done){
            AjaxBestPromise.post({
                url:'http://'+location.hostname+':12448/ejemplo/post/files',
                multipart:true,
                data:{
                    theFiles:[newFile(['this is a txt file'],'filename1.txt')],
                    description:'Other data field in utf-8: ¡Sí!'
                }
            }).then(function(result){
                expect(result).to.be('filename1.txt of size 18 content: this is a ...  received. Other data field in utf-8: ¡Sí!');
                done();
            }).catch(done);
        });

        it("post 3 files", function(done){
            AjaxBestPromise.post({
                url:'http://'+location.hostname+':12448/ejemplo/post/files',
                multipart:true,
                data:{
                    theFiles:[
                        newFile(['this is a txt file'],'filename1.txt'),
                        newFile(['this is another file'],'filename2.txt'),
                        newFile(['¡Éste es otro!'],'filename3.txt'),
                    ],
                }
            }).then(function(result){
                expect(result).to.be(
                    'filename1.txt of size 18 content: this is a ... , '+
                    'filename2.txt of size 20 content: this is an... , '+
                    'filename3.txt of size 16 content: ¡Éste es o... '+
                    ' received. '
                );
                done();
            }).catch(done);
        });
    }

    it("receive status 400", function(done){
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/error',
            data:{p_valor_malo:'¡ágape<b>c&d; drop table!'}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            expect(err.message).to.match(/400 .*¡ágape<b>c&d; drop table!/);
            expect(err.status).to.be(400);
            done();
        }).catch(done);
    });

    it("receive status and code", function(done){
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/error-code',
            data:{}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            expect(err.message).to.eql('403 ErrOr A901b: this is a message');
            expect(err.status).to.be(403);
            expect(err.code).to.be('A901b');
            done();
        }).catch(done);
    });

    it("receive status without code", function(done){
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/error-wo-code',
            data:{}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            expect(err.message).to.eql('403 ERROR. Here is not a code\n\n\nErrOr A901b: this is a message');
            expect(err.status).to.be(403);
            expect(err.code).to.be(undefined);
            expect(typeof err.code).to.be('undefined');
            done();
        }).catch(done);
    });

    it("receive details", function(done){
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/error-code-with-attr',
            data:{}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            expect(err.message).to.eql('400 ERROR A901c: this is the message\ncode: "A901c"\ndetails: "the \\"dets\\""');
            expect(err.status).to.be(400);
            expect(err.code).to.be('A901c');
            expect(err.details).to.be('the "dets"');
            done();
        }).catch(done);
    });

    /*
    it("receive status 404 not found of real world", function(done){
        AjaxBestPromise.get({
            url:'http://inexistent.com.ux/',
            data:{a: 101}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            // if(!window.chrome && !navigator.mozApps){
                expect(err.message).to.match(/404 Cannot GET .*inexistent.com.ux/);
                expect(err.status).to.be(404);
            //}
            done();
        }).catch(done);
    });
    */

    it("receive status 404 not found", function(done){
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/inexistente',
            data:{a: 101}
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            // if(!window.chrome && !navigator.mozApps){
                expect(err.message).to.match(/404(.|\n)*Cannot GET.*\/ejemplo\/inexistente/m);
                expect(err.status).to.be(404);
            //}
            done();
        }).catch(done);
    });
    
    it("receive chunked data", function(done){
        this.timeout(4000);
        var expected=/line 1\n-?line 2 es primo!\n-?line 3 es primo!\n/;
        var obtained=[];
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/flujo',
            data:{limite:3, delay:400}
        }).onChunk(function(chunk){
            obtained.push(chunk);
        }).then(function(result){
            expect(obtained.join('-')).to.match(expected);
            done();
        }).catch(done);
    });

    it("error in a chunked post", function(done){
        this.timeout(4000);
        AjaxBestPromise.post({
            url:'http://'+location.hostname+':12448/ejemplo/error',
            data:{p_valor_malo:'¡ágape<b>c&d; drop table!'}
        }).onChunk(function(chunk){
            done(new Error('does not expect a chunk result: '+chunk));
        }).then(function(result){
            done(new Error('does not expect a resolved result'));
        }).catch(function(err){
            expect(err.message).to.match(/404(.|\n)*Cannot POST.*\/ejemplo\/error/m);
            expect(err.status).to.be(404);
            done();
        }).catch(done);
    });

    it("catchs error directly in a chunked post", function(done){
        AjaxBestPromise.post({
            url:'http://'+location.hostname+':12448/ejemplo/error',
            data:{p_valor_malo:'¡ágape<b>c&d; drop table!'}
        }).catch(function(err){
            expect(err.message).to.match(/404(.|\n)*Cannot POST.*\/ejemplo\/error/);
            expect(err.status).to.be(404);
            done();
        }).catch(done);
    });
    
    it("receive line stream", function(done){
        this.timeout(4000);
        var emmited =[['∞'],{alpha:'α', beta:'β', gamma:'γ'}, false, null, "¡águila!", "last"];
        var expected=['"one"\n','2\r','3\r\n'].concat(emmited.map(function(o){ 
            return JSON.stringify(o)+(o==='last'?'':'\n');
        }));
        var obtained=[];
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/line-stream',
            data:{
                data:JSON.stringify(emmited),
                delay:150
            }
        }).onLine(function(line, ender){
            obtained.push(line+(ender||''));
        }).then(function(result){
            expect(obtained).to.eql(expected);
            done();
        }).catch(done);
    });
    
    it("receive json stream", function(done){
        this.timeout(4000);
        var expected=["one",2,3,['∞'],{alpha:'α', beta:'β', gamma:'γ'}, "¡águila!"];
        var obtained=[];
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/json-stream',
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