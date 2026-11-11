import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['tests/**/*.test.ts'],fileParallelism:false,testTimeout:20000,coverage:{provider:'v8',include:['src/modules/**/*.ts','src/app.ts'],thresholds:{lines:80,functions:80,branches:70,statements:80},reporter:['text','json-summary','html']}}});
