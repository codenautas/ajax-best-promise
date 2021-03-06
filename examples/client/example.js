"use string";

function eid(x){
    return document.getElementById(x);
}

window.addEventListener('load', function(){
    eid('start').onclick=function(){
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
    };
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

