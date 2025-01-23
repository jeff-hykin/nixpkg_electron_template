# Inspired by pkgs/applications/editors/uivonim/default.nix
# and pkgs/by-name/in/indiepass-desktop/package.nix
{
    builtin ? builtins,
    nixpkgs ? (builtin.import
        (builtin.fetchTarball 
            ({
                url = "https://github.com/NixOS/nixpkgs/archive/23.11.tar.gz";
            })
        )
        ({})
    ),
    lib             ? nixpkgs.lib,
    buildNpmPackage ? nixpkgs.buildNpmPackage,
    fetchFromGitHub ? nixpkgs.fetchFromGitHub,
    electron        ? nixpkgs.electron,
}:
    let 
        packageJson = builtin.fromJSON (builtin.readFile ../package.json);
        pname = builtin.getAttr "name" packageJson;
        version = builtin.getAttr "version" packageJson;
        entrypoint = builtin.getAttr "main" packageJson;
    in
        buildNpmPackage {
            pname = pname;
            version = version;

            src = ./..;

            npmDepsHash = "sha256-yPTxj8bSBepp+bJTK82LHtdM+jcJ9S0nhXFCeiRrhos="; # you will get an error about mismatching hash the first time. Just copy and paste the hash here

            # Useful for debugging, just run "nix-shell" and then "electron ."
            nativeBuildInputs = [
                electron
            ];

            # Otherwise it will try to run a build phase (via npm build) that we don't have or need, with an error:
            # Missing script: "build"
            # This method is used in pkgs/by-name/in/indiepass-desktop/package.nix
            dontNpmBuild = true;

            # Needed, otherwise you will get an error:
            # RequestError: getaddrinfo EAI_AGAIN github.com
            env = {
                ELECTRON_SKIP_BINARY_DOWNLOAD = 1;
            };
            
            # The node_modules/XXX is such that XXX is the "name" in package.json
            # The path might differ, for instance in electron-forge you need build/main/main.js
            postInstall = ''
                makeWrapper ${electron}/bin/electron $out/bin/${pname} \
                    --add-flags $out/lib/node_modules/${pname}/${entrypoint}
            '';
        }