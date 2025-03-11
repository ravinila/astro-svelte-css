/// <reference types="astro/client" />

declare global {
  namespace App {
    interface Locals {
      usedComponents: string[];
      isCssExternal: boolean;
      cssList: string[];
    }
  }
}

export {};
