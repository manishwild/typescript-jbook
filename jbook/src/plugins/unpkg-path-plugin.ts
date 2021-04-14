import * as esbuild from 'esbuild-wasm';



// (async () => {
//   await fileCache.setItem('color','red')
//   const color = await fileCache.getItem('color')
//   console.log(color)
// })()

export const unpkgPathPlugin = () => {
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
      // handle main file of a module
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


    },
  };
};
