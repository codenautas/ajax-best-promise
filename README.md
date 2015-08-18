# ajax-best-promise
Ajax with best promise - Ajax with stream data

<!--multilang v0 en:README.md es:LEEME.md -->

<!--lang:es--]

Ajax con promesas y soporte para lecturas parciales

[!--lang:*-->

<!-- cucardas -->
![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![downloads](https://img.shields.io/npm/dm/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![build](https://img.shields.io/travis/codenautas/ajax-best-promise/master.svg)](https://travis-ci.org/codenautas/ajax-best-promise)
[![coverage](https://img.shields.io/coveralls/codenautas/ajax-best-promise/master.svg)](https://coveralls.io/r/codenautas/ajax-best-promise)
[![climate](https://img.shields.io/codeclimate/github/codenautas/ajax-best-promise.svg)](https://codeclimate.com/github/codenautas/ajax-best-promise)
[![dependencies](https://img.shields.io/david/codenautas/ajax-best-promise.svg)](https://david-dm.org/codenautas/ajax-best-promise)

<!--multilang buttons-->

language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md) - 

<!--lang:en-->

## Instalation

This is a **client-side** module. Download [here](https://raw.githubusercontent.com/codenautas/ajax-best-promise/master/bin/ajax-best-promise.js)

<!--lang:es--]

## Instalación

Este módulo corre **del lado del navegador**. [Descargar](https://raw.githubusercontent.com/codenautas/ajax-best-promise/master/bin/ajax-best-promise.js)

[!--lang:*-->

<!--lang:en-->

## Use

<!--lang:es--]

## Uso

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

<!--lang:en-->

## Chunked data

The **main adventage** of **ajax-best-promise** is the ability for process partial data 
in three flavors: `onChunk`, `onLine`, `onJson`

<!--lang:es--]

## Lectura parcial

La principal ventaja de este módulo es la capacidad de definir
un manejador para ir recibiendo el texto desde el servidor 
a medida que lo va mandando con la función 
`onChunk`, o línea a línea con `onLine` o objeto a objeto JSON con `onJson`.

`onJson` espera un flujo de objetos JSON, que vienen uno por línea

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

<!--lang:*-->

## Licence

MIT

.............................



