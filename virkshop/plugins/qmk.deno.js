import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.72/main/file_system.js"
import { Console } from "https://deno.land/x/quickr@0.6.72/main/console.js"
// import { run, Stdin, Stdout, Stderr, returnAsString, hasCommand } from "https://deno.land/x/quickr@0.6.72/main/run.js"
import { generateKeys, encrypt, decrypt, hashers } from "https://deno.land/x/good@0.7.18/encryption.js"
import $ from "https://deno.land/x/dax@0.39.2/mod.ts"
const $$ = (...args)=>$(...args).noThrow()
// await $$`false`

// todo:
    // git.addToGitIgnore()

// indent everything
export default ({id, pluginSettings, virkshop, shellApi, helpers })=>({
    settings: {
        // virtualEnvFolder: `${virkshop.pathTo.project}/.venv`,
        // requirementsTxtPath: `${virkshop.pathTo.project}/requirements.txt`,
        ...pluginSettings,
    },
    commands: {
        // async pip(args) {
        //     // always use the version connected to python, and disable the version check, but otherwise be the same
        //     await run("python", "-m", "pip", "--disable-pip-version-check", ...args)
        // },
    },
    events: {
        async '@setup_with_system_tools/qmk'() {
            helpers.shortTermDoOneTime(async ()=>{
                console.log(`        [qmk] runing qmk setup`)
                await $$`qmk --interactive setup -H ${virkshop.pathTo.project}/home`.stdinText(`y\ny\ny\ny\n`)
            })
        },
        // async '@setup_without_system_tools/python'() {
        //    return {
        //        // deadlines are in chronological order (top is the shortest/soonest)
        //        // HOWEVER, the startup time will be optimized if code is
        //        // placed in the bottom-most deadline (last deadline)
        //        // because of async/concurrent computations
        //        async beforeSetup(virkshop) {
        //            // virkshop.injectUsersCommand("sudo")
        //        },
        //        async beforeReadingSystemTools(virkshop) {
        //        },
        //        async beforeShellScripts(virkshop) {
        //        },
        //        async beforeEnteringVirkshop(virkshop) {
        //        },
        //     }
        // },
        // async '@example.ignore.deno.js/054_000_setup_python_venv'() {
        //     // having a TMPDIR is required for venv to work
        //     const TMPDIR      = Console.env.TMPDIR      = `${virkshop.pathTo.fakeHome}/tmp.cleanable`
        //     const VIRTUAL_ENV = Console.env.VIRTUAL_ENV = this.settings.virtualEnvFolder
        //     const PATH        = Console.env.PATH        = `${this.settings.virtualEnvFolder}/bin:${virkshop.pathTo.fakeHome}/.local/bin:${Console.env.PATH}`
            
        //     await FileSystem.ensureIsFolder(TMPDIR)
            
        //     // 
        //     // regenerate venv if needed
        //     // 
        //     const pythonVersion = await run`python --version ${Stdout(returnAsString)}`
        //     const oldPythonVersion = helpers.longTermColdStorage.get('pythonVersion')
        //     const pythonVersionChangedSinceLastTime = oldPythonVersion && oldPythonVersion !== pythonVersion
        //     if (pythonVersionChangedSinceLastTime) {
        //         if (await Console.askFor.yesNo(`\nIt looks like your python version has changed from ${oldPythonVersion} to ${pythonVersion}\nIt is highly recommended to regenerate your python venv when this happens.\nWould you like me to go ahead and do that?`)) {
        //             this.events['purge/054_000_python_venv']()
        //         }
        //     } else {
        //         helpers.longTermColdStorage.set('pythonVersion',  pythonVersion)
        //     }
            
        //     // 
        //     // create venv if needed
        //     // 
        //     const virtualEnvPath = await FileSystem.info(VIRTUAL_ENV)
        //     let shellStatements = []
        //     if (virtualEnvPath.isFolder) {
        //         console.log(`        [qmk] creating virtual env for python`)
        //         // clean first
        //         await this.events['clean/054_000_python_venv']()
        //         // then create venv
        //         const { success } = await run`python -m venv ${this.settings.virtualEnvFolder}`
        //         if (success) {
        //             // 
        //             // install pip modules if needed
        //             // 
        //             this.methods.cachedInstallFromRequirementsTxt()

        //             // export ENV variables
        //             shellStatements.push(   shellApi.modifyEnvVar({ name: "PATH"       , overwriteAs: PATH        })   )
        //             shellStatements.push(   shellApi.modifyEnvVar({ name: "TMPDIR"     , overwriteAs: TMPDIR      })   )
        //             shellStatements.push(   shellApi.modifyEnvVar({ name: "VIRTUAL_ENV", overwriteAs: VIRTUAL_ENV })   )
        //         }
        //     }
        //     return shellStatements
        // },
        // async 'clean/054_000_python_venv'() {
        //     for (const eachFolder of await glob('**/__pycache__')) {
        //         FileSystem.remove(eachFolder)
        //     }
        // },
        // async 'purge/054_000_python_venv'() {
        //     await Promise.all([
        //         FileSystem.remove(this.settings.virtualEnvFolder),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.cache/pip`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.cache/pypoetry/`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.local/share/virtualenv`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.config/pypoetry`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.config/matplotlib`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.ipython`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.jupyter`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.keras`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.local/share/jupyter`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/.python_history`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/Library/Application Support/pypoetry`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/Library/Application Support/virtualenv`),
        //         FileSystem.remove(`${virkshop.pathTo.fakeHome}/Library/Library/Preferences/pypoetry`),
        //         // for future poetry support:
        //         // ;((async ()=>{
        //         //     if (await hasCommand(`poetry`)) {
        //         //         run`poetry cache clear . --all ${Stdin(`yes\nyes\nyes\nyes\nyes\nyes\nyes\nyes\nyes\n`)}`
        //         //     }
        //         // })())
        //     ])
        // },
        // async 'git/post-update/054_000_python_venv'() {
        //     this.methods.cachedInstallFromRequirementsTxt() 
        // },
    },
    methods: {
        // async setupQmkIfNeeded() {
        //     helpers.shortTermDoOneTime(async ()=>{
        //         console.log(`        [qmk] runing qmk setup`)
        //         await $$`qmk --interactive setup -H ${virkshop.pathTo.project}/home`.stdinText(`y\ny\ny\ny\n`)
        //     })
        // },
    },
})