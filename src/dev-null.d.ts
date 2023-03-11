
declare module 'dev-null' {
  import { Writable } from 'stream'
  const DevNull: () => Writable
  export default DevNull
}
