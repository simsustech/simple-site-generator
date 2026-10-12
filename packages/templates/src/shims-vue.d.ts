// Mocks all files ending in `.vue` showing them as plain Vue instances.
//
// Without this, `tsc --noEmit` cannot resolve any `./Foo.vue` import in this
// package (TS2307), which made the type gate in every step unrunnable.
// Mirrors the shim already shipped in the generated app template.
declare module '*.vue' {
  import type { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}
