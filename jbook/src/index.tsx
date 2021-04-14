import * as esbuild from 'esbuild-wasm'
import { useState, useEffect, useRef } from 'react'
import ReactDom from 'react-dom'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'
import { fetchPlugin } from './plugins/fetch-plugin'


const App = () => {
  const ref = useRef<any>()
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: '/esbuild.wasm'
    })
    //console.log(service)
  }
  useEffect(() => {
   startService()
  }, []);

  const onclickHandler = async () => {
    //console.log(input)
    if (!ref.current) {
      return
    }
    //transform means transpile
    // const result = await ref.current.transform(input,{
    //   loader: 'jsx',
    //   target: 'es2015'
    // })
    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [
        unpkgPathPlugin(), 
        fetchPlugin(input)

      ],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
        
      }
    })
    //console.log(result)
    setCode(result.outputFiles[0].text)
  }

  return (
    <div>
     <textarea value={input} onChange={e => setInput(e.target.value)}></textarea>
     <div>
       <button onClick={onclickHandler}>Submit</button>
     </div>
     <pre>{code}</pre>
    </div>
  )
}

ReactDom.render(<App />,document.querySelector('#root'))