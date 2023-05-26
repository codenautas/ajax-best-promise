"use strict";

(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* istanbul ignore next */
    if(typeof root.globalModuleName !== 'string'){
        root.globalModuleName = name;
    }
    /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object'){
        module.exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define(factory);
    }else if(typeof exports === 'object'){
        exports[root.globalModuleName] = factory();
    }else{
        root[root.globalModuleName] = factory();
    }
    root.globalModuleName = null;
})(/*jshint -W040 */this, 'AjaxBestPromise', function() {
/*jshint +W040 */

/*jshint -W004 */
var AjaxBestPromise = {};
/*jshint +W004 */

function newXMLHttpRequest_OrSomethingLikeThis(){
    /*jshint -W117 */
    var ajax;
    /* istanbul ignore else*/ // only old browsers
    if(window.XMLHttpRequest){
        ajax = new XMLHttpRequest();
    }else{
        try {
            ajax = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(e) {
            ajax = new ActiveXObject("Microsoft.XMLHTTP");
        }                
    }
    return ajax;
    /*jshint +W117 */
}

/* global Promise */
AjaxBestPromise.createMethodFunction=function(method){
    return function(params){
        var registeredHeadersConsumer = false;
        var promiseForReturn = function(chunkConsumer, progressHooks){
            return new Promise(function(resolve,reject){
                var ajax = newXMLHttpRequest_OrSomethingLikeThis();
                var receivePart;
                progressHooks.forEach(function(f){
                    ajax.upload.addEventListener('progress',f);
                });
                if(params.uploading){
                    ajax.upload.addEventListener('progress',params.uploading);
                }
                var headerFun = function(){
                    if (ajax.readyState == 2 && registeredHeadersConsumer) {
                        var headers = {}
                        ajax.getAllResponseHeaders().split(/\r?\n/).forEach(function(line){
                            var list = line.split(':');
                            headers[list[0].toLowerCase()] = list.slice(1).join(':').trimLeft();
                        })
                        registeredHeadersConsumer(headers);
                        registeredHeadersConsumer = false;
                    }
                }
                if(chunkConsumer){
                    var initialPos=0;
                    var endPos=0;
                    receivePart=function(isLastPart){
                        /* istanbul ignore else*/ // wired cases. I not know how to emulate that
                        try{
                            if(endPos<ajax.responseText.length){
                                initialPos=endPos;
                                endPos=ajax.responseText.length;
                                chunkConsumer(ajax.responseText.substr(initialPos,endPos),isLastPart);
                            }else if(isLastPart){
                                chunkConsumer('',isLastPart);
                            }
                        }catch(err){
                            reject(err);
                        }
                    };
                    // var interval = setInterval(receivePart,1000); 
                    // if('multipart' in ajax){
                    //     ajax.multipart=true;
                    // }
                    var proFun=function(){
                        /* istanbul ignore next */ 
                        if(ajax.readyState != 2 && ajax.readyState != 3 && ajax.readyState != 4){
                            return;
                        }
                        headerFun();
                        /* istanbul ignore next */ 
                        if(!('status' in ajax) || ajax.status != 200){
                            return;
                        }
                        receivePart();
                    };
                    /* istanbul ignore else*/ // only old browsers
                    if('onload' in ajax){
                        ajax.onprogress=proFun;
                    }
                }else{
                    receivePart=function(){};
                }
                var okFun=function(){
                    if(ajax.status!=200){
                        var error = Error(ajax.status+' '+ajax.responseText);
                        error.status = ajax.status;
                        var matches = ajax.responseText.match(/^[0-9]*\s*ERROR\s?([^\n:]+):/i);
                        if(matches && matches[1]){
                            error.code = matches[1];
                        }
                        var extraLines=ajax.responseText.split(/\r?\n/);
                        for(var i=1; i<extraLines.length; i++){
                            var line=extraLines[i];
                            if(line.trim()==='' || /^--------+\s*$/.test(line)){
                                break;
                            }
                            var matchesAttr = line.match(/^(\w+):\s(.*)$/);
                            if(matchesAttr){
                                try{
                                    var jsonValue=matchesAttr[2];
                                    var value=jsonValue==="undefined"?undefined:JSON.parse(jsonValue);
                                    error[matchesAttr[1]]=value;
                                }catch(errJson){
                                    error[matchesAttr[1]]=matchesAttr[2]+'';
                                }
                            }
                        }
                        reject(error);
                    }else{
                        receivePart(true);
                        resolve(ajax.responseText);
                    }
                };
                var errFun=function(err){
                    /* global ProgressEvent */
                    if(err instanceof Error){
                        reject(err);
                    }else if(err instanceof ProgressEvent /* || err instanceof XMLHttpRequestProgressEvent*/){
                        console.log('******************** err *********************', err)
                        var newError=new Error('404 Cannot '+method+' '+params.url+' (ProgressEvent)');
                        newError.originalError=err;
                        newError.status=404;
                        reject(newError);
                    }else{
                        var newBoxError=new Error('Boxed error '+JSON.stringify(err)+' Cannot get '+params.url);
                        newBoxError.originalError=err;
                        reject(newBoxError);
                    }
                };
                /* istanbul ignore else*/ // only old browsers
                if('onload' in ajax){
                    ajax.onload=okFun;
                    ajax.onerror=errFun;
                    ajax.onreadystatechange=headerFun
                }else{
                    ajax.onreadystatechange=function(e){
                        headerFun();
                        if(ajax.readyState == 4){
                            return okFun(e);
                        }
                    };
                }
                var paqueteAEnviar;
                if(params.multipart){
                    paqueteAEnviar=new FormData();
                    Object.keys(params.data).forEach(function(key){
                        var data=params.data[key];
                        if(data && typeof data === 'object' && data.length){
                            Array.prototype.forEach.call(data,function(file){
                                paqueteAEnviar.append(key, file, file.name);
                            });
                        }else{
                            paqueteAEnviar.append(key, data);
                        }
                    });
                }else{
                    paqueteAEnviar=Object.keys(params.data || {}).map(function(key){
                        return key+'='+encodeURIComponent(params.data[key]);
                    }).join('&');
                }
                var url=params.url+((paqueteAEnviar && method!=='POST')?'?'+paqueteAEnviar:'');
                ajax.open(method,url,true);
                ajax.setRequestHeader('X-Requested-With','XMLHttpRequest');
                if (params.headers) {
                    for (var key in params.headers) {
                        ajax.setRequestHeader(key, params.headers[key]);
                    }
                }
                if(method==='POST'){
                    if(!params.multipart){
                        ajax.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                    }
                    ajax.send(paqueteAEnviar);
                }else{
                    ajax.send();
                }
            });
        };
        var intermediateObject={
            progressHooks:[],
            uploading: function(progressHook){
                this.progressHooks.push(progressHook);
                return intermediateObject;
            },
            onJson: function(jsonConsumer){
                return intermediateObject.onLine(function(line){
                    if(line){
                        jsonConsumer(JSON.parse(line));
                    }
                });
            },
            onLine: function(lineConsumer){
                var remain="";
                return promiseForReturn(function chunkConsumer(chunk,isLastPart){
                    remain+=chunk;
                    var slices=remain.split(/(\r\n|\r(?!\n)|\n)/);
                    while(slices.length>(isLastPart?0:1)){
                        lineConsumer(slices.shift(),slices.shift(),!slices.length);
                    }
                    remain=slices.shift();
                },this.progressHooks);
            },
            onChunk:function(chunkConsumer){
                return promiseForReturn(chunkConsumer,this.progressHooks);
            },
            onHeaders:function(headersConsumer){
                registeredHeadersConsumer = headersConsumer;
                delete intermediateObject.onHeaders;
                return intermediateObject;
            },
            then:function(resolve,reject){
                return promiseForReturn(null,this.progressHooks).then(resolve,reject);
            },
            'catch':function(reject){
                return promiseForReturn(null,this.progressHooks)["catch"](reject);
            }
        };
        return intermediateObject;
    };
};

AjaxBestPromise.post=AjaxBestPromise.createMethodFunction('POST');
AjaxBestPromise.get=AjaxBestPromise.createMethodFunction('GET');
AjaxBestPromise.put=AjaxBestPromise.createMethodFunction('PUT');
AjaxBestPromise.patch=AjaxBestPromise.createMethodFunction('PATCH');
AjaxBestPromise.delete=AjaxBestPromise.createMethodFunction('DELETE');
AjaxBestPromise.options=AjaxBestPromise.createMethodFunction('OPTIONS');
AjaxBestPromise.head=AjaxBestPromise.createMethodFunction('HEAD');
AjaxBestPromise.connect=AjaxBestPromise.createMethodFunction('CONNECT');
AjaxBestPromise.trace=AjaxBestPromise.createMethodFunction('TRACE');

AjaxBestPromise.fromElements=function fromElements(listOfElementsOrIds,addParam,base){
    var actual=base;
    if(typeof actual==="undefined"){
        actual={};
    }
    addParam=addParam||function(actual,name,value){
        actual[name]=value;
        return actual;
    };
    listOfElementsOrIds.forEach(function(elementOrId){
        var element;
        if(typeof elementOrId == 'string'){
            /*jshint -W117 */
            element=document.getElementById(elementOrId);
            /*jshint +W117 */
        }else{
            element=elementOrId;
        }
        /*jshint -W117 */
        if(!element || !(element instanceof Element)){
            throw new Error('AjaxBestPromise.fromElements must receive a list of elements');
        }
        /*jshint +W117 */
        var value;
        if('value' in element){
            value=element.value;
        }else{
            /* istanbul ignore else*/ // only old IE
            if('textContent' in element){
                value=element.textContent;
            }else{
                value=element.innerText;
            }
        }
        actual=addParam(actual,element.id,value);
    });
    return actual;
};

AjaxBestPromise.completePath=function completePath(listOfElementsOrIds){
    return AjaxBestPromise.fromElements(listOfElementsOrIds,function(actual,name,value){
        return (!actual?'':actual+'/')+encodeURI(value);
    },'');
};

return AjaxBestPromise;

});