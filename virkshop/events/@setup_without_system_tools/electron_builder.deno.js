import $ from "https://deno.land/x/dax@0.39.2/mod.ts"
const $$ = (...args)=>$(...args).noThrow()
export const deadlines = {
    async beforeSetup(virkshop) {
        let isDirectory = false
        try {
            isDirectory = Deno.lstatSync("/nix/var/nix/profiles/per-user/root/channels").isDirectory
        } catch (error) {
            
        }
        if (!isDirectory) {
            if (prompt(`For some reason, electron-builder needs "/nix/var/nix/profiles/per-user/root/channels" to exits\nYours does not.\nWould you like me to create it for you? (y/n)`,).startsWith("y")) {
                console.log(`creating directory`)
                await $$`sudo mkdir -p /nix/var/nix/profiles/per-user/root/channels`
                console.log(`directory created`)
            } else {
                console.log(`Okay, please make the directory yourself (you'll need sudo)`)
                Deno.exit(1)
            }
        }
    },
    async beforeReadingSystemTools(virkshop) {
    },
    async beforeShellScripts(virkshop) {
    },
    async beforeEnteringVirkshop(virkshop) {
        if (Deno.build.os == "darwin") {
            await virkshop.injectUsersCommand("sips")
            await virkshop.injectUsersCommand("hdiutil")
        }
    }
}
