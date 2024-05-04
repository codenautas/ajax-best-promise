"use strict";

var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs-promise');
var path = require('path');
var serveContent = require('serve-content');
var jade = require('pug');
var multiparty = require('multiparty');

var MiniTools = require('mini-tools');

var PORT=12448;

var karma;
var karmaIndex=process.argv.indexOf('--karma');
if(karmaIndex>0){
    var karma = require('karma');
    var karmaConfig = require('../../karma.conf.js');
    var options;
    karmaConfig({set:function(opts){ 
        options=opts; 
        if(process.argv.indexOf('--single-run')>0){
            options.singleRun=true;
        }
        var posBrowsers = process.argv.indexOf('--browsers')
        if(posBrowsers>0){
            options.browsers=(process.argv[posBrowsers+1]||'').split(',');
        }
    }},{singleRun:process.argv.indexOf('--single-run')>0 || process.env.SINGLE_RUN});
    console.log('karma starting');
    var karmaServer = new karma.Server(options, function(exitCode) {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
    })
    karmaServer.start();
    console.log('karma starting',options.port);
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(function(req,res,next){
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
        next();
    }
});

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

var validExts=[
    'html',
    'jpg','png','gif',
    'css','js','manifest'];

app.use('/',serveContent('./bin', {
    index: ['index.html'], 
    extensions:[''], 
    allowedExts:validExts
}));

app.use('/',serveContent('./examples/client', {
    index: ['index.html'], 
    extensions:[''], 
    allowedExts:validExts
}));

var actualConfig;

var clientDb;

var server=app.listen(PORT + (process.argv.indexOf('--cloneport') + 1), function(event) {
    console.log('Listening on port %d', server.address().port);
});

app.get('/',serveHtmlText('<h1>Ajax-best-promise example </h1>'));

if(karma){
    app.use(function(req,res,next){
        res.append('Access-Control-Allow-Origin', '*');
        res.append('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
        next();
    });
}

app.get('/ejemplo/suma',function(req,res){
    var params=req.query;
    // probar con localhost:12448/ejemplo/suma?p1=3&p2=7
    res.send((Number(req.query.p1)+Number(req.query.p2)).toString());
});

app.post('/ejemplo/post/upper',function(req,res){
    var params=req.body;
    res.send(params.text.toUpperCase());
});

app.get('/ejemplo/error',function(req,res){
    var params=req.query;
    // no es lo mejor devolverle los datos al cliente
    res.status(400).send(JSON.stringify({message:'invalid parameters', data:req.query.p_valor_malo}));
});

app.get('/ejemplo/error-code',function(req,res){
    res.status(403);
    res.end('ErrOr A901b: this is a message');
});

app.get('/ejemplo/error-wo-code',function(req,res){
    res.status(403);
    res.end('ERROR. Here is not a code\n\n\nErrOr A901b: this is a message');
});

app.get('/ejemplo/error-code-with-attr',function(req,res){
    MiniTools.globalOpts.serveErr.propertiesWhiteList=['code','details'];
    Promise.resolve().then(function(){
        var err=new Error("this is the message");
        err.code="A901c";
        err.details='the "dets"';
        throw err;
        res.end("ok!");
    }).catch(MiniTools.serveErr(req,res));
});

app.get('/ejemplo/flujo',function(req,res){
    var params=req.query;
    var paso=0;
    var primos=[];
    res.append('Content-Type', 'application/octet-stream'); // por chrome bug segun: http://stackoverflow.com/questions/3880381/xmlhttprequest-responsetext-while-loading-readystate-3-in-chrome
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
        if(paso>=params.limite){
            res.end();
            clearInterval(iterador);
        }
    },params.delay||1000);
});

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

app.get('/ejemplo/line-stream',streamEmiter(false));
app.get('/ejemplo/json-stream',streamEmiter(true));

app.post('/ejemplo/post/files', function(req, res, next){
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
    });
});

app.options(/\/.*/, function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Mirror");
    res.status(204);
    res.end();
});

app.post('/ejemplo/post/headers', function(req, res, next){
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
});
