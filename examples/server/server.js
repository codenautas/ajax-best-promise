"use strict";

var _ = require('lodash');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promises = require('best-promise');
var fs = require('fs-promise');
var path = require('path');
var readYaml = require('read-yaml-promise');
var extensionServeStatic = require('extension-serve-static');
var jade = require('jade');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

function serveJade(pathToFile,anyFile){
    return function(req,res,next){
        if(path.extname(req.path)){
            console.log('req.path',req.path);
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
        }).catch(serveErr(req,res,next));
    }
}

// probar con http://localhost:12348/ajax-example
app.use('/',serveJade('examples/client',true));

function serveHtmlText(htmlText){
    return function(req,res){
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Length', htmlText.length);
        res.end(htmlText);
    }
}

function serveErr(req,res,next){
    return function(err){
        if(err.message=='next'){
            return next();
        }
        console.log('ERROR', err);
        console.log('STACK', err.stack);
        var text='ERROR! '+(err.code||'')+'\n'+err.message+'\n------------------\n'+err.stack;
        res.writeHead(200, {
            'Content-Length': text.length,
            'Content-Type': 'text/plain; charset=utf-8'
        });
        res.end(text);
    }
}

var mime = extensionServeStatic.mime;

var validExts=[
    'html',
    'jpg','png','gif',
    'css','js','manifest'];

// ajax-best-promise.js
// 
app.use('/',extensionServeStatic('./bin', {
    index: ['index.html'], 
    extensions:[''], 
    staticExtensions:validExts
}));

app.use('/',extensionServeStatic('./examples/client', {
    index: ['index.html'], 
    extensions:[''], 
    staticExtensions:validExts
}));

var actualConfig;

var clientDb;

var PORT=12448;

var server=app.listen(PORT, function(event) {
    console.log('Listening on port %d', server.address().port);
});

app.get('/',serveHtmlText('<h1>Ajax-best-promise example </h1>'));

app.get('/ejemplo/suma',function(req,res){
    var params=req.query;
    // probar con localhost:12448/ejemplo/suma?alfa=3&beta=7
    res.send((Number(req.query.p1)+Number(req.query.p2)).toString());
});

app.get('/ejemplo/error',function(req,res){
    var params=req.query;
    // no es lo mejor devolverle los datos al cliente
    res.status(400).send(JSON.stringify({message:'invalid parameters', data:req.query.p_valor_malo}));
});

app.get('/ejemplo/flujo',function(req,res){
    var params=req.query;
    var paso=0;
    var primos=[];
    var esPrimo=function(x){
        if(x<2) return false;
        for(var i=0; i<primos.length; i++){
            var divisor=primos[i];
            if(x % divisor ==0){
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
        console.log(data);
        if(paso>=params.limite){
            res.end();
            clearInterval(iterador);
        }
    },1000);
});
