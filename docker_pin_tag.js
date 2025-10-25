#!/usr/bin/env -S deno run --allow-all
// deno run --allow-net find_digest.ts <hashVersion> <NAMESPACE> <REPO_NAME>
import $ from "https://esm.sh/@jsr/david__dax@0.43.2/mod.ts"
const $$ = (...args)=>$(...args).noThrow()
// await $$`false`
// (await $$`false`).code
// await $$`false`.text("stderr")
// await $$`false`.text("combined")
// await $$`echo`.stdinText("yes\n")


if (!Deno.args[0]) {
    console.error("Ex:\n    docker_pin_tag.js 'docker.io/electronuserland/builder:wine'\n    docker_pin_tag.js 'docker.io/electronuserland/builder:wine@sha256:8bb6fa0f99a00a5b845521910508958ebbb682b59221f0aa4b82102c22174164'")
    Deno.exit(1)
}

// ex: fromStatment="docker.io/electronuserland/builder:wine@sha256:8bb6fa0f99a00a5b845521910508958ebbb682b59221f0aa4b82102c22174164"
let fromStatment = Deno.args[0].trim()

// 
// parse the FROM statement
// 
// remove prefixy stuff
fromStatment = fromStatment.replace(/^FROM\s+/,"")
fromStatment = fromStatment.replace(/^docker\.io\//,"")
var [namespace, repo, tag] = fromStatment.split(/\/|:/g)
if (!tag) {
    tag = "latest"
}
if (!namespace || !repo) {
    console.error("Invalid FROM statement:", fromStatment)
    console.error("I'd usually expect an argument like:\n   FROM docker.io/electronuserland/builder:wine")
    console.error("OR:\n    FROM docker.io/electronuserland/builder:wine@sha256:8bb6fa0f99a00a5b845521910508958ebbb682b59221f0aa4b82102c22174164")
    Deno.exit(1)
}

if (tag.includes("@")) {
    var [tag, hashVersion] = tag.split("@")
}

// 
// get the digest if its missing
// 
try_again: while (true) {
    if (!hashVersion) {
        console.log(`trying to get the hash by running: docker images --digests --format '{{json .}}'`)
        const imagesText = await $`docker images --digests --format '{{json .}}'`.text()
        const rows = imagesText.split("\n").map(each=>JSON.parse(each))
        const relevantRows = rows.filter(each=>each.Repository.includes(`${namespace}/${repo}`)&&each.Tag===tag)
        if (relevantRows.length === 0) {
            // need to pull it
            if (confirm("No digest found for this image. Can I pull it to get the digest?")) {
                await $`docker pull ${namespace}/${repo}`
                continue try_again
            } else {
                console.error("No digest found for this image. Please provide the digest manually. (add @DIGEST_HASH to the end of the from statement)")
                Deno.exit(1)
            }
        }
        hashVersion = relevantRows[0].Digest
    }
    break
}

hashVersion = hashVersion.replace(/^sha256:/,"")

// 
// find the tag names
// 
let i = 0
while (true) {
    i++
    if (i % 100 === 0) {
        console.log(`\x1b[35mSleeping for 7 seconds on page ${i}...\x1b[0m`)
        await new Promise((resolve) => setTimeout(resolve, 7000))
    }

    console.log(`Looking into page: ${i}`)
    const url = `https://registry.hub.docker.com/v2/repositories/${namespace}/${repo}/tags/?page=${i}`
    
    const res = await fetch(url)
    if (!res.ok) {
        console.error(`Error fetching page ${i}: ${res.statusText}`)
        break
    }
    

    const data = await res.json()
    // ex:
    // {
    //     "count": 211,
    //     "next": "https://registry.hub.docker.com/v2/repositories/electronuserland/builder/tags/?page=4\u0026page_size=10",
    //     "previous": "https://registry.hub.docker.com/v2/repositories/electronuserland/builder/tags/?page=2\u0026page_size=10",
    //     "results": [
    //         {
    //             "creator": 829364,
    //             "id": 15629479,
    //             "images": [
    //                 {
    //                     "architecture": "amd64",
    //                     "features": "",
    //                     "variant": null,
    //                     "digest": "sha256:fac74c33945b46a77be575572dd8d780074d5f5df57f53e35e6eca3c8961c0e6",
    //                     "os": "linux",
    //                     "os_features": "",
    //                     "os_version": null,
    //                     "size": 391534524,
    //                     "status": "active",
    //                     "last_pulled": "2025-10-20T14:25:49.979705387Z",
    //                     "last_pushed": "2025-03-10T13:16:06.237299291Z"
    //                 }
    //             ],
    //             "last_updated": "2025-03-10T13:17:59.30754Z",
    //             "last_updater": 3852355,
    //             "last_updater_username": "onegoldfish",
    //             "name": "latest",
    //             "repository": 1844822,
    //             "full_size": 391534524,
    //             "v2": true,
    //             "tag_status": "active",
    //             "tag_last_pulled": "2025-10-20T14:25:49.979705387Z",
    //             "tag_last_pushed": "2025-03-10T13:17:59.30754Z",
    //             "media_type": "application/vnd.docker.container.image.v1+json",
    //             "content_type": "image",
    //             "digest": "sha256:fac74c33945b46a77be575572dd8d780074d5f5df57f53e35e6eca3c8961c0e6"
    //         }
    //     ]
    // }
    const results = data.results ?? []
    const matches = results.filter(each=>each.digest===`sha256:${hashVersion}`||(each.images||[]).some(each=>each.digest===`sha256:${hashVersion}`))
    // console.debug(`matches is:`,matches)
    if (matches.length > 0) {
        for (const each of matches) {
            console.log(`FROM docker.io/${namespace}/${repo}:${each.name}   # last updated: ${each.last_updated}, e.g. ${ monthsAgo(each.last_updated)} months ago`)
        }
        if (confirm("Should I stop here?")) {
            Deno.exit(0)
        }
    }
    
}

function monthsAgo(dateString) {
    const pastDate = new Date(dateString);
    const today = new Date();

    let yearsDiff = today.getFullYear() - pastDate.getFullYear();
    let monthsDiff = today.getMonth() - pastDate.getMonth();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    // If the day of the month hasn't been reached yet, subtract one month
    if (today.getDate() < pastDate.getDate()) {
        totalMonths -= 1;
    }

    return totalMonths;
}