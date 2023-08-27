#!/bin/sh

npm run typeorm schema:sync -- -d dist/src/storage/typeorm/sqlClient.js
npm run start