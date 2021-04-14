import * as esbuild from 'esbuild-wasm'
import axios from 'axios'
import localForage from 'localforage'

const fileCache = localForage.createInstance({
  name: 'filecache'
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
    build.onLoad({ filter: /.*/ }, async (args: any) => {
      //console.log('onLoad', args);
      
//this way we can check any version we like  
//import React,{useState} from 'react@16.0.0'
      if (args.path === 'index.js') {
        return {
          loader: 'jsx',
          contents: inputCode,
           // `
          // import React,{useState} from 'react'
          //   console.log(React,useState);
          // `,
        };
      } 
      // check to see if we have already fetched this file
      // and if it in the cache
      // const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path)

      // //if it is,return it immedialtely
      // if (cachedResult) {
      //   return cachedResult
      // }

      const {data, request} = await axios.get(args.path)
      //console.log(request)

      //console.log(args.path)
      const fileType = args.path.match(/.css$/) ? 'css' : 'jsx'

      const escaped = data.replace(/\n/g, '').replace(/"/g, '\\"').replace(/'/g, "\\'")
      const contents = fileType === 'css' ?
      `
       const style = document.createElement('style');
       style.innerText = '${escaped}';
       document.head.appendChild(style);
      ` 
      : data

      const result: esbuild.OnLoadResult =  {
        loader: 'jsx',
        contents,
        resolveDir: new URL('./', request.responseURL).pathname
      }
      //store response in cache
      await fileCache.setItem(args.path, result)

      return result
    });
    }
  }
}


