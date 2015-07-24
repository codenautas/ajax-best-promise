<!-- multilang from README.md




NO MODIFIQUE ESTE ARCHIVO. FUE GENERADO AUTOMÁTICAMENTE POR multilang.js




-->
# ajax-best-promise
Ajax with best promise - Ajax with stream data



Ajax con promesas y soporte para lecturas parciales


![designing](https://img.shields.io/badge/stability-designing-red.svg)
[![version](https://img.shields.io/npm/v/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![downloads](https://img.shields.io/npm/dm/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![build](https://img.shields.io/travis/codenautas/ajax-best-promise/master.svg)](https://travis-ci.org/codenautas/ajax-best-promise)
[![coverage](https://img.shields.io/coveralls/codenautas/ajax-best-promise/master.svg)](https://coveralls.io/r/codenautas/ajax-best-promise)
[![climate](https://img.shields.io/codeclimate/github/codenautas/ajax-best-promise.svg)](https://codeclimate.com/github/codenautas/ajax-best-promise)
[![dependencies](https://img.shields.io/david/codenautas/ajax-best-promise.svg)](https://david-dm.org/codenautas/ajax-best-promise)

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)


## Instalación

Este módulo corre **del lado del navegador**. [Descargar](https://raw.githubusercontent.com/codenautas/ajax-best-promise/master/bin/ajax-best-promise.js)



## Uso


```js
AjaxBestPromise.get({
    url:'http://example.com:3333/service/do.php',
    data:{ alfa: 1, betha: 2}
}).then(function(result){
    console.log(result);
}).catch(function(err){
    console.log(err);
});
```


## Licence

MIT

.............................



