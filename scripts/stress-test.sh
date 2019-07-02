#!/bin/bash
ab -c 100 -n 1000  -H 'content-type: application/json' -p scripts/data.json http://127.0.0.1:3000/secret-path
