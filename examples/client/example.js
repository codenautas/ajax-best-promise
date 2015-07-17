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
            errores_no_esperados.textContent=''+err
        });
    }
});