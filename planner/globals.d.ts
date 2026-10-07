// esbuild loads the board's stylesheet as text (see esbuild.config.mjs)
declare module "*.css" {
  const text: string
  export default text
}
