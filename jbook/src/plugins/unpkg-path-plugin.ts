import * as esbuild from 'esbuild-wasm';
import axios from 'axios'
import localForage from 'localforage'

const fileCache = localForage.createInstance({
  name: 'filecache'
});

// (async () => {
//   await fileCache.setItem('color','red')
//   const color = await fileCache.getItem('color')
//   console.log(color)
// })()

export const unpkgPathPlugin = (inputCode: string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      //this code is replacement of 1 if statement
      // handle root entry file of 'index.js'
      build.onResolve({ filter: /(^index\.js$)/},() => {
        return { path: 'index.js', namespace: 'a'}
      })
      
      // handle realtives path in a module
      //this code is replacement of 2 if statement from down
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href,
        }
      })

      build.onResolve({ filter: /.*/ }, async (args: any) => {
        // console.log('onResolve', args);
        // 1
        // if (args.path === 'index.js') {
        //   return { path: args.path, namespace: 'a' };
        // } 
        //2
        // if (args.path.includes('./') || args.path.includes('../') ) {
        //   return {
        //     namespace: 'a',
        //     path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href,
        //   }
        // }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }
        // else if (args.path === 'tiny-test-pkg') {
        //   return { path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js', namespace: 'a' }
        // }
        
      });
//83
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);
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
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path)

        //if it is,return it immedialtely
        if (cachedResult) {
          return cachedResult
        }

        const {data, request} = await axios.get(args.path)
        //console.log(request)
        
        const result: esbuild.OnLoadResult =  {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname
        }
        //store response in cache
        await fileCache.setItem(args.path, result)

        return result
      });
    },
  };
};
