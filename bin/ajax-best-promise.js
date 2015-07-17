var AjaxBestPromise={};

AjaxBestPromise.createMethodFunction=function(method){
    return function(params){
        return new Promise(function(resolve,reject){
            var ajax = new XMLHttpRequest();
            if(!method){
                return reject(new Error('debe indicar el method en ajax'));
            }
            if(params.pasoApaso){
                ajax.onreadystatechange=function(){
                    if(ajax.readyState===3){
                        if(ajax.status && ajax.status!=200){
                            reject(new Error(ajax.status+' '+ajax.responseText));
                        }else{
                            params.pasoApaso(ajax.responseText);
                        }
                    }
                }
            }
            ajax.onload=function(e){
                if(ajax.status!=200){
                    reject(new Error(ajax.status+' '+ajax.responseText));
                }else{
                    resolve(ajax.responseText);
                }
            }
            ajax.onerror=reject;
            var paqueteAEnviar=Object.keys(params.data).map(function(key){
                return key+'='+encodeURIComponent(params.data[key]);
            }).join('&');
            if(method==='POST'){
                ajax.open(method,params.url);
                ajax.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                ajax.send(paqueteAEnviar);
            }else{
                var url=params.url+(paqueteAEnviar?'?'+paqueteAEnviar:'');
                ajax.open(method,url);
                ajax.send();
            }
        });
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