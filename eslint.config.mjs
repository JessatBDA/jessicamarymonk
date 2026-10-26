import { defineConfig, globalIgnores } from 'eslint/config';
import webVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
export default defineConfig([...webVitals, ...typescript, globalIgnores(['.next/**', 'next-env.d.ts'])]);
