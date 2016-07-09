<!--multilang v0 es:LEEME.md en:README.md -->
# ajax-best-promise

<!--lang:es-->
Ajax con promesas y soporte para lecturas parciales

<!--lang:en--]
Ajax with best promise - Ajax with stream data

[!--lang:*-->

<!-- cucardas -->
![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![downloads](https://img.shields.io/npm/dm/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![build](https://img.shields.io/travis/codenautas/ajax-best-promise/master.svg)](https://travis-ci.org/codenautas/ajax-best-promise)
[![coverage](https://img.shields.io/coveralls/codenautas/ajax-best-promise/master.svg)](https://coveralls.io/r/codenautas/ajax-best-promise)
[![climate](https://img.shields.io/codeclimate/github/codenautas/ajax-best-promise.svg)](https://codeclimate.com/github/codenautas/ajax-best-promise)
[![dependencies](https://img.shields.io/david/codenautas/ajax-best-promise.svg)](https://david-dm.org/codenautas/ajax-best-promise)
[![qa-control](http://codenautas.com/github/codenautas/ajax-best-promise.svg)](http://codenautas.com/github/codenautas/ajax-best-promise)

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->

## Instalación

Este módulo corre **del lado del navegador**. [Descargar](https://raw.githubusercontent.com/codenautas/ajax-best-promise/master/bin/ajax-best-promise.js)

<!--lang:en--]

## Instalation

This is a **client-side** module. Download [here](https://raw.githubusercontent.com/codenautas/ajax-best-promise/master/bin/ajax-best-promise.js)

[!--lang:*-->

<!--lang:es-->

## Uso

<!--lang:en--]

## Use

[!--lang:*-->

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

<!--lang:es-->

## Lectura parcial

La principal ventaja de este módulo es la capacidad de definir
un manejador para ir recibiendo el texto desde el servidor 
a medida que lo va mandando con la función 
`onChunk`, o línea a línea con `onLine` o objeto a objeto JSON con `onJson`.

`onJson` espera un flujo de objetos JSON, que vienen uno por línea

<!--lang:en--]

## Chunked data

The **main adventage** of **ajax-best-promise** is the ability for process partial data 
in three flavors: `onChunk`, `onLine`, `onJson`

[!--lang:*-->

```js
AjaxBestPromise.get({
    url:'http://example.com:3333/service/do.php',
    data:{ alfa: 1, betha: 2}
}).onChunk(function(partialText){
    console.log(partialText);
}).then(function(){
    console.log('done!');
}).catch(function(err){
    console.log(err);
});
```

<!--lang:es-->

## Manejo de errores

Otra ventaja importante es la reconstrucción de los errores.
**La llamada devolverá un error en las situaciones lógicas donde uno espera que sea error**
(no como el AJAX clásico que considera normal recibir un error 403)

Además el objeto error tiene la propiedad status y, cuando se puede deducir también code.

<!--lang:en--]

## Error handler

Other **adventage** of **ajax-best-promise** is the ability for reconstruct the error object.

[!--lang:*-->

```js
AjaxBestPromise.get({
    url:'http://inexistent.com.ux/',
    data:{ alfa: 1, betha: 2}
}).then(function(result){
    console.log(result);
}).catch(function(err){
    console.log(err); // 404 Cannot GET inexistent.com.ux
    console.log(err.status); // 404
});
```

<!--lang:es-->
## Licencia

<!--lang:en--]
## Licence

[!--lang:*-->

MIT
