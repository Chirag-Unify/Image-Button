#!/bin/bash

# Compile TypeScript files
tsc figma.ts
if [ $? -ne 0 ]; then
  echo "Failed to compile figma.ts"
  exit 1
fi

tsc unify.ts
if [ $? -ne 0 ]; then
  echo "Failed to compile unify.ts"
  exit 1
fi

# Run the scripts in sequence
node figma.js
if [ $? -ne 0 ]; then
  echo "figma.js failed"
  exit 1
fi

node unify.js
if [ $? -ne 0 ]; then
  echo "unify.js failed"
  exit 1
fi

echo "All done! unify.json generated." 