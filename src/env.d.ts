/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type R2 = import("@cloudflare/workers-types").R2;
type ENV = {
  // replace `MY_KV` with your KV namespace
  R2: R2;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}
