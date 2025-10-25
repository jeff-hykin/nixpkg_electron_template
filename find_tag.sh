#!/bin/bash
SHA256_HASH='8bb6fa0f99a00a5b845521910508958ebbb682b59221f0aa4b82102c22174164'
NAMESPACE='electronuserland'
REPO_NAME='builder'

for i in {1..1000}; do 
    if [ $i -eq 100 ]; then
        echo -e "\e[35mSleeping for 7 seconds on page $i...\e[0m"
        sleep 7
    fi
    echo "Looking into page: $i"
    result=$(curl -s "https://registry.hub.docker.com/v2/repositories/$NAMESPACE/$REPO_NAME/tags/?page=$i" | jq -r ".results[] | select(.[\"images\"][][\"digest\"] == \"sha256:$hash\" or .digest == \"sha256:$SHA256_HASH\")") || break
    if [ ! -z "$result" ]; then
        echo "$result" | jq '.'
        break
    fi
done