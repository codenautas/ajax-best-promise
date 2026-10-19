"use strict";

var bodyParser = require('body-parser');
var fs = require('fs').promises;
var path = require('path');
var jade = require('pug');
var multiparty = require('multiparty');

var MiniTools = require('mini-tools');

var { Server4Test, launch } = require('server4test');

function multipartParser(req,res,next){
    if((req.headers['content-type']||'').match(/^multipart\/form-data/)){
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            req.multipartErr=err;
            req.fields=fields;
            req.files=files;
            // console.log('req.multipartErr', req.multipartErr);
            // console.log('req.fields      ', req.fields      );
            // console.log('req.files       ', req.files       );
            next(err);
        });
    }else{
        return next();
    }
}

function serveHtmlText(htmlText){
    return function(req,res){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Length', htmlText.length);
        res.end(htmlText);
    }
}

function serveJade(pathToFile,anyFile){
    return function(req,res,next){
        if(path.extname(req.path)){
            return next();
        }
        Promise.resolve().then(function(){
            var fileName=pathToFile+(anyFile?req.path+'.jade':'');
            return fs.readFile(fileName, {encoding: 'utf8'})
        }).catch(function(err){
            if(anyFile && err.code==='ENOENT'){
                throw new Error('next');
            }
            throw err;
        }).then(function(fileContent){
            var htmlText=jade.render(fileContent);
            serveHtmlText(htmlText)(req,res);
        }).catch(MiniTools.serveErr(req,res,next));
    }
}

function flujo(req,res){
    var params=req.query;
    var paso=0;
    var primos=[];
    res.append('Content-Type', 'application/octet-stream'); // por chrome bug segun: http://stackoverflow.com/questions/3880381/xmlhttprequest-responsetext-while-loading-readystate-3-in-chrome
    var esPrimo=function(x){
        if(x<2) return false;
        for(var i=0; i<primos.length; i++){
            var divisor=primos[i];
            if(x % divisor === 0){
                return false;
            }
        }
        primos.push(x);
        return true;
    }
    var iterador=setInterval(function(){
        paso++;
        var data='line '+paso+(esPrimo(paso)?' es primo!':'')+'\n';
        res.write(data);
        if(paso>=params.limite){
            res.end();
            clearInterval(iterador);
        }
    },params.delay||1000);
}

function allowHeaders(res){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Rorrim, Mirror")
}

function streamEmiter(fakeOneBreakLine){
    return function(req,res){
        var params=req.query;
        var dataReadyForStream=JSON.parse(params.data).map(function(element){
            return JSON.stringify(element);
        }).join('\n');
        var chunks=['"one"\n','2\r3\r\n',dataReadyForStream.substr(0,10),dataReadyForStream.substr(10),'',''];
        var step=0;
        allowHeaders(res);
        res.setHeader('Content-Type', 'application/octet-stream'); // por chrome bug segun: http://stackoverflow.com/questions/3880381/xmlhttprequest-responsetext-while-loading-readystate-3-in-chrome
        if (req.get("Mirror") ){
            res.setHeader("Mirror", "m: " + req.get("Mirror"))
        }
        var iterador=setInterval(function(){
            res.write(chunks[step]);
            if(step===1 && fakeOneBreakLine){
                res.write('\n');
            }
            step++;
            if(step>=chunks.length){
                res.end();
                clearInterval(iterador);
            }
        },params.delay||1000);
    };
}

class ExampleServer extends Server4Test{
    directServices(){
        return super.directServices().concat([
            {path:'/ejemplo', method:'use', middleware:bodyParser.urlencoded({extended:true})},
            {path:'/ejemplo', method:'use', middleware:multipartParser},
            {path:'/ejemplo/suma', method:'get', middleware:function(req,res){
                // probar con localhost:12448/ejemplo/suma?p1=3&p2=7
                res.send((Number(req.query.p1)+Number(req.query.p2)).toString());
            }},
            {path:'/ejemplo/post/upper', method:'post', middleware:function(req,res){
                var params=req.body;
                res.send(params.text.toUpperCase());
            }},
            {path:'/ejemplo/error', method:'get', middleware:function(req,res){
                // no es lo mejor devolverle los datos al cliente
                res.status(400).send(JSON.stringify({message:'invalid parameters', data:req.query.p_valor_malo}));
            }},
            {path:'/ejemplo/error-code', method:'get', middleware:function(req,res){
                res.status(403);
                res.end('ErrOr A901b: this is a message');
            }},
            {path:'/ejemplo/error-wo-code', method:'get', middleware:function(req,res){
                res.status(403);
                res.end('ERROR. Here is not a code\n\n\nErrOr A901b: this is a message');
            }},
            {path:'/ejemplo/error-code-with-attr', method:'get', middleware:function(req,res){
                MiniTools.globalOpts.serveErr.propertiesWhiteList=['code','details'];
                Promise.resolve().then(function(){
                    var err=new Error("this is the message");
                    err.code="A901c";
                    err.details='the "dets"';
                    throw err;
                }).catch(MiniTools.serveErr(req,res));
            }},
            {path:'/ejemplo/flujo', method:'get', middleware:flujo},
            {path:'/ejemplo/line-stream', method:'get', middleware:streamEmiter(false)},
            {path:'/ejemplo/json-stream', method:'get', middleware:streamEmiter(true)},
            {path:'/ejemplo/post/files', method:'post', middleware:function(req, res, next){
                Promise.all(req.files.theFiles.map(function(file){
                    return fs.readFile(file.path).then(function(data){
                        return file.originalFilename+' of size '+file.size+' content: '+data.toString().substr(0,10)+'... ';
                    });
                })).then(function(parts){
                    res.send(
                        parts.join(', ')+' received. '+
                        // (typeof req.fields.description === "string"?'':'not string: '+typeof req.fields.description+' -> ')+
                        (req.fields.description||'')
                    );
                    res.end();
                }).catch(next);
            }},
            {path:'/ejemplo/post/headers', method:'post', middleware:function(req, res){
                /** @type {string} */
                var param = req.get('mirror').toString();
                if (!param) {
                    res.status(404)
                    res.send('no esta el header')
                    return
                }
                allowHeaders(res);
                res.set('rorrim', param.split('').reverse().join(''));
                res.end('ok '+req.body.text);
            }},
            // probar con http://localhost:12448/example
            {path:'/', method:'use', middleware:serveJade('examples/client',true)},
        ]);
    }
}

launch({serverClass:ExampleServer});
