# ajax-best-promise

Ajax with best promise - Ajax with stream data


![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![downloads](https://img.shields.io/npm/dm/ajax-best-promise.svg)](https://npmjs.org/package/ajax-best-promise)
[![build](https://img.shields.io/travis/codenautas/ajax-best-promise/master.svg)](https://travis-ci.org/codenautas/ajax-best-promise)
[![coverage](https://img.shields.io/coveralls/codenautas/ajax-best-promise/master.svg)](https://coveralls.io/r/codenautas/ajax-best-promise)
[![dependencies](https://img.shields.io/david/codenautas/ajax-best-promise.svg)](https://david-dm.org/codenautas/ajax-best-promise)


language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)


## Instalation

This is a **client-side** module. Download [here](https://raw.githubusercontent.com/codenautas/ajax-best-promise/master/bin/ajax-best-promise.js)



## Use


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


## Chunked data

The **main adventage** of **ajax-best-promise** is the ability for process partial data
in three flavors: `onChunk`, `onLine`, `onJson`


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

## haders

You can send headers in the header property and recieve it with the `onHeader` function.

```js
AjaxBestPromise.put({
    url:'http://example.com:3333/service/',
    data:{ alfa: 1, betha: 2},
    headers:{
        Authorization: 'Bearer ' + token
    }
}).onHeaders(function(headers){
    newId = headers.Location;
}).then(function(){
    console.log('data inserted', newId);
}).catch(function(err){
    console.log('error inserting data', err);
});
```


## Error handler

Other **adventage** of **ajax-best-promise** is the ability for reconstruct the error object.


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

## Modern JS

```ts
try{
    var newId: string
    await AjaxBestPromise.put({
        url:'http://example.com:3333/service/',
        data:{ alfa: 1, betha: 2},
        headers:{
            Authorization: 'Bearer ' + token
        }
    }).onHeaders(function(headers){
        newId = headers.Location;
    });
    console.log('data inserted', newId);
}catch(err){
    console.log('error inserting data', err);
}
```

## Tests with real devices

NPM version |Device                 |OS             |nav                      |obs
------------|-----------------------|---------------|-------------------------|----
0.1.3       | Samsung Galaxy Note 4 | Android 6.0.1 | Chrome Mobile 44.0.2403 |
0.1.3       | iPad mini Retina      | iOS 8.4.0     | Mobile Safari 8.0.0     |
0.1.3       | VMWare                | WinXP         | IE 8.0.0                | polyfill:many - fail:line stream & json stream


## Licence


MIT
