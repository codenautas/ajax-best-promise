"use strict";

var AjaxBestPromise={};

AjaxBestPromise.createMethodFunction=function(method){
    return function(params){
        var promiseForReturn = function(chunkConsumer){
            return new Promise(function(resolve,reject){
                var ajax = new XMLHttpRequest();
                if(!method){
                    return reject(new Error('debe indicar el method en ajax'));
                }
                if(chunkConsumer){
                    var initialPos=0;
                    var endPos=0;
                    var receivePart=function(){
                        if(endPos<ajax.responseText.length){
                            initialPos=endPos;
                            endPos=ajax.responseText.length;
                            chunkConsumer(ajax.responseText.substr(initialPos,endPos));
                        }
                    }
                    // var interval = setInterval(receivePart,1000);
                    ajax.multipart=true;
                    ajax.onprogress=function(pe){
                        if (ajax.readyState != 2 && ajax.readyState != 3 && ajax.readyState != 4)
                            return;
                        if (ajax.readyState == 3 && ajax.status != 200)
                            return;
                        receivePart();
                    };
                }else{
                    var receivePart=function(){};
                }
                ajax.onload=function(e){
                    receivePart();
                    // clearInterval(interval);
                    if(ajax.status!=200){
                        reject(new Error(ajax.status+' '+ajax.responseText));
                    }else{
                        resolve(ajax.responseText);
                    }
                }
                ajax.onerror=function(err){
                    if(!(err instanceof Error)){
                        err=new Error('Error boxed '+err+' '+JSON.stringify(err)+' / '+ajax);
                    }
                    reject(err) ;
                }
                var paqueteAEnviar=Object.keys(params.data).map(function(key){
                    return key+'='+encodeURIComponent(params.data[key]);
                }).join('&');
                var url=params.url+((paqueteAEnviar && method!=='POST')?'?'+paqueteAEnviar:'');
                ajax.open(method,url,true);
                ajax.setRequestHeader('X-Requested-With','XMLHttpRequest');
                if(method==='POST'){
                    ajax.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                    ajax.send(paqueteAEnviar);
                }else{
                    ajax.send();
                }
            });
        };
        return {
            onChunk:function(chunkConsumer){
                return promiseForReturn(chunkConsumer);
            },
            then:function(resolve,reject){
                return promiseForReturn().then(resolve,reject);
            },
            'catch':function(reject){
                return promiseForReturn().catch(reject);
            }
        }
    }
}

AjaxBestPromise.post=AjaxBestPromise.createMethodFunction('POST');
AjaxBestPromise.get=AjaxBestPromise.createMethodFunction('GET');

AjaxBestPromise.fromElements=function fromElements(listOfElementsOrIds){
    var ajaxParameters={};
    listOfElementsOrIds.forEach(function(elementOrId){
        if(typeof elementOrId == 'string'){
            var element=document.getElementById(elementOrId);
        }else{
            var element=elementOrId;
        }
        if(!element || !(element instanceof Element)){
            throw new Error('AjaxBestPromise.fromElements must receive a list of elements');
        }
        ajaxParameters[element.id]=element.value;
    });
    return ajaxParameters;
}