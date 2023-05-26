"use string";

function eid(x){
    return document.getElementById(x);
}

window.addEventListener('load', function(){
    eid('start').onclick=function(){
        if(!!"include tested in previous versions (or put a ! for skip)"){
            AjaxBestPromise.get({
                url:'/ejemplo/suma',
                data:AjaxBestPromise.fromElements(['p1', eid('p2')])
            }).then(function(result){
                eid('result').textContent=result;
            }).catch(function(err){
                error_suma.textContent=''+err
            });
            AjaxBestPromise.get({
                url:'/ejemplo/inexistente',
                data:{a:'99'}
            }).then(function(result){
                eid('url_inex_then').textContent=result;
            }).catch(function(err){
                url_inex_catch.textContent=''+err;
            });
            AjaxBestPromise.get({
                url:'/ejemplo/error',
                data:{p_valor_malo:eid('datos_feos').value}
            }).then(function(result){
                eid('datos_feos_then').textContent=result;
            }).catch(function(err){
                datos_feos_catch.textContent=''+err;
            });
            eid('pasos_recibidos').textContent='';
            eid('pasos_recibidos').className='res_partial';
            AjaxBestPromise.get({
                url:'/ejemplo/flujo',
                data:{limite:eid('cantidad_pasos').value},
            }).onChunk(function(resultPartial){
                eid('pasos_recibidos').textContent+=resultPartial;
            }).then(function(result){
                eid('pasos_recibidos').textContent=result;
                eid('pasos_recibidos').className='res_ok';
            }).catch(function(err){
                paso_a_paso_err.textContent=''+err;
            });
            AjaxBestPromise.post({
                url:'http://'+location.hostname+':12448/ejemplo/post/headers',
                data:{text:eid('dato_post').value},
                headers:{mirror:eid('mirror').value}
            }).onHeaders(function(headers){
                var result = headers.rorrim;
                eid('dato_post_head').textContent = result ?? 'undefined';
                eid('dato_post_head').className = result == 'ojepse' ? 'res_ok' : 'res_err';
            }).then(function(result){
                eid('dato_post_rec').textContent = result ?? 'undefined';
                eid('dato_post_rec').className = result == 'ok súper fan' ? 'res_ok' : 'res_err';
            }).catch(function(err){
                dato_post_err.textContent=''+err;
            });
        }
        var expected=["one",2,3,['∞'],{alpha:'α', beta:'β', gamma:'γ'}, "¡águila!"];
        var obtained=[];
        AjaxBestPromise.get({
            url:'http://'+location.hostname+':12448/ejemplo/json-stream',
            data:{
                data:JSON.stringify(expected.slice(3)),
                delay:350
            },
            headers:{
                mirror: eid('json_mirror').value
            }
        }).onHeaders(function(headers){
            eid('json_post_head').textContent = headers.mirror;
            eid('json_post_head').className = headers.mirror == 'm: ' + eid('json_mirror').value ? 'res_ok' : 'res_err';
        }).onJson(function(json){
            eid('json_post_rec').textContent+='\n'+JSON.stringify(json);
            obtained.push(json);
        }).then(function(){
        }).catch(function(err){
            json_post_err.textContent=''+err;
        });

    };
    eid('onetest').onclick=function(){
        AjaxBestPromise.post({
            url:'http://'+location.hostname+':12448/ejemplo/post/headers',
            data:{text:'¡águila!'},
            headers:{mirror:'espejo'},
        }).then(function(result){
            console.log(result);
        }).catch(function(err){
            console.log(err)
        });
    }
    eid('upload').onclick=function(){
        AjaxBestPromise.post({
            url:'/ejemplo/post/files',
            multipart:true,
            data:{
                theFiles:eid('idFiles').files,
                description:eid('idDescription').textContent
            },
        }).uploading(function(progress){
            eid('loading').textContent+=progress.lengthComputable+','+progress.loaded+','+progress.total+'... ';
        }).onChunk(function(resultPartial){
            eid('pasos_recibidos').textContent+=resultPartial;
        }).then(function(result){
            eid('pasos_recibidos').textContent=result;
            eid('pasos_recibidos').className='res_ok';
        }).catch(function(err){
            paso_a_paso_err.textContent=''+err;
        });
    };
});

