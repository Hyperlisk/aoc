#!/usr/bin/env bash

set -e

pnpm run compile $1.ts
node js/$1.js
