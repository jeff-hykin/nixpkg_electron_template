{
    description = "Nixpkgs_electron_template_actions";
    inputs = {
        libSource.url = "github:divnix/nixpkgs.lib";
        flake-utils.url = "github:numtide/flake-utils";
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
        home-manager.url = "github:nix-community/home-manager/release-25.05";
        home-manager.inputs.nixpkgs.follows = "nixpkgs";
        xome.url = "github:jeff-hykin/xome";
        xome.inputs.nixpkgs.follows = "nixpkgs";
        xome.inputs.home-manager.follows = "home-manager";
    };
    outputs = { self, libSource, flake-utils, nixpkgs, xome, ... }:
        flake-utils.lib.eachSystem flake-utils.lib.defaultSystems (system:
            let
                pkgs = import nixpkgs {
                    inherit system;
                    overlays = [
                    ];
                    config = {
                        allowUnfree = true;
                        allowInsecure = false;
                        permittedInsecurePackages = [
                        ];
                    };
                };
                lib = libSource.lib;
                flattenDevInputs = (inputs:
                    let
                        flattenedInputs = builtins.concatMap (x: x) (builtins.map (each: if builtins.isList each then each else [ each ]) inputs);
                        activeInputs = (builtins.filter
                            (each:
                                if ! (builtins.hasAttr "onlyIf" each) then
                                    true
                                else 
                                    (each.onlyIf != false && each.onlyIf != null)
                            )
                            flattenedInputs
                        );
                    in
                        {
                            packages = (builtins.map
                                (each: each.pkg)
                                (builtins.filter
                                    (each:
                                        (builtins.hasAttr
                                            "pkg"
                                            each
                                        )
                                    )
                                    activeInputs
                                )
                            );
                            shellHook = (
                                let
                                    inputsWithShellHooks = (builtins.filter
                                        (each:
                                            (
                                                (builtins.hasAttr
                                                    "shellHook"
                                                    each
                                                ) && (
                                                    (builtins.typeOf each.shellHook) == "string"
                                                )
                                            )
                                        )
                                        activeInputs
                                    );
                                    shellHookStrings = (builtins.map
                                        (each: each.shellHook)
                                        inputsWithShellHooks
                                    );
                                    shellHookString = (builtins.concatStringsSep "\n" shellHookStrings);
                                in
                                    shellHookString
                            );
                        }
                );
                pkgsForPkgConfigTool = [
                    # given inputs
                    pkgs.atk.dev
                    pkgs.gdk-pixbuf.dev
                    pkgs.gtk3.dev
                    pkgs.pango.dev
                    pkgs.libayatana-appindicator-gtk3.dev
                    pkgs.glib.dev
                    # discovered needed inputs
                    pkgs.dbus.dev
                    pkgs.libpng.dev
                    pkgs.libjpeg.dev
                    pkgs.libtiff.dev
                    pkgs.cairo.dev
                    pkgs.fribidi.dev
                    pkgs.fontconfig.dev
                    pkgs.harfbuzz.dev
                    pkgs.libthai.dev
                    pkgs.freetype.dev
                    pkgs.xorg.libXrender.dev
                    pkgs.xorg.libXft.dev
                    pkgs.zlib
                    pkgs.zlib.dev
                    pkgs.libffi.dev
                    pkgs.libselinux.dev
                    pkgs.expat.dev
                    pkgs.graphite2.dev
                    pkgs.bzip2.dev
                    pkgs.lerc.dev
                    pkgs.libsepol.dev
                    # libs not even on the list, but needed at link time 
                    pkgs.json-glib
                    pkgs.libselinux
                    pkgs.wayland
                    pkgs.libjson
                    pkgs.tinysparql
                    pkgs.tinysparql.dev
                    pkgs.json-glib.dev
                    pkgs.libselinux.dev
                    pkgs.wayland.dev
                ];
                devInputs = flattenDevInputs [
                    { pkg=pkgs.nodejs;  }
                    { pkg=pkgs.esbuild; }
                    { pkg=pkgs.zip;     }
                    { pkg=pkgs.unzip;   }
                    { pkg=pkgs.less;    }
                    # Linux stuff
                    { pkg=pkgs.gcc; onlyIf=pkgs.stdenv.isLinux; }
                    { pkg=pkgs.dpkg; onlyIf=pkgs.stdenv.isLinux; }
                    { pkg=pkgs.fakeroot; onlyIf=pkgs.stdenv.isLinux; }
                    { pkg=pkgs.rpm; onlyIf=pkgs.stdenv.isLinux; }
                    { pkg=pkgs.pkg-config; onlyIf=pkgs.stdenv.isLinux; }
                    (builtins.map  (each:    { pkg=each; onlyIf=pkgs.stdenv.isLinux; }     ) pkgsForPkgConfigTool)
                    {
                        onlyIf=pkgs.stdenv.isLinux;
                        shellHook = ''
                            export PKG_CONFIG_PATH=${lib.escapeShellArg (builtins.concatStringsSep ":" (map (x: "${x}/lib/pkgconfig") pkgsForPkgConfigTool))}
                            export LD_LIBRARY_PATH=${lib.escapeShellArg (builtins.concatStringsSep ":" (map (x: "${x}/lib") pkgsForPkgConfigTool))}
                            export LIBRARY_PATH=${lib.escapeShellArg (builtins.concatStringsSep ":" (map (x: "${x}/lib") pkgsForPkgConfigTool))}
                        '';
                    }
                ];
            in
                {
                    # this is how the package is built (as a dependency)
                    packages.default = pkgs.stdenv.mkDerivation {
                        src = ./.;
                        name = (builtins.toJSON (builtins.readFile ./package.json)).name;

                        buildInputs = devInputs.packages;

                        buildPhase = ''
                            export HOME=$(mktemp -d) # Needed by npm to avoid global install warnings
                            npm install
                            npx electron-forge package
                        '';
                        
                        desktopItem = super.makeDesktopItem {
                            name = "my-custom-app";
                            exec = "my-custom-app"; # Or the full path if not in $out/bin
                            genericName = "My Custom Application";
                            categories = "Utility;Application;";
                            desktopName = "My Custom App";
                            icon = "my-custom-app-icon"; # Name of an icon in your icon theme or a path
                        };
                        
                        installPhase = ''
                            mkdir -p $out
                            cp -r out/* $out/
                        '';
                    };
                    
                    # development environment for contributions
                    devShells = xome.simpleMakeHomeFor {
                        inherit pkgs;
                        pure = true;
                        commandPassthrough = [ "codesign" "hdiutil" "sips" "git" ];
                        homeModule = {
                            # for home-manager examples, see: 
                            # https://deepwiki.com/nix-community/home-manager/5-configuration-examples
                            # all home-manager options: 
                            # https://nix-community.github.io/home-manager/options.xhtml
                            home.homeDirectory = "/tmp/virtual_homes/nixpkgs_electron_template_actions";
                            home.stateVersion = "25.05";
                            home.packages = devInputs.packages ++ [
                                # vital stuff
                                pkgs.dash # provides "sh" 
                                pkgs.coreutils-full
                                
                                # optional stuff
                                pkgs.gnugrep
                                pkgs.findutils
                                pkgs.wget
                                pkgs.curl
                                pkgs.unixtools.locale
                                pkgs.unixtools.more
                                pkgs.unixtools.ps
                                pkgs.unixtools.getopt
                                pkgs.unixtools.ifconfig
                                pkgs.unixtools.hostname
                                pkgs.unixtools.ping
                                pkgs.unixtools.hexdump
                                pkgs.unixtools.killall
                                pkgs.unixtools.mount
                                pkgs.unixtools.sysctl
                                pkgs.unixtools.top
                                pkgs.unixtools.umount
                                pkgs.git
                                pkgs.htop
                                pkgs.ripgrep
                            ];
                            
                            programs = {
                                home-manager = {
                                    enable = true;
                                };
                                zsh = {
                                    enable = true;
                                    enableCompletion = true;
                                    autosuggestion.enable = true;
                                    syntaxHighlighting.enable = true;
                                    shellAliases.ll = "ls -la";
                                    history.size = 100000;
                                    # this is kinda like .zshrc
                                    initContent = ''
                                        ${devInputs.shellHook}
                                        
                                        # lots of things need "sh"
                                        ln -s "$(which dash)" "$HOME/.local/bin/sh" 2>/dev/null
                                        
                                        setopt interactivecomments
                                        
                                        # without this npm (from nix) will not keep a reliable cache (it'll be outside of the xome home)
                                        export npm_config_cache="$HOME/.cache/npm"
                                        
                                        # 
                                        # offer to run npm install
                                        # 
                                        if ! [ -d "node_modules" ]
                                        then
                                            question="I don't see node_modules, should I run npm install? [y/n]";answer=""
                                            while true; do
                                                echo "$question"; read response
                                                case "$response" in
                                                    [Yy]* ) answer='yes'; break;;
                                                    [Nn]* ) answer='no'; break;;
                                                    * ) echo "Please answer yes or no.";;
                                                esac
                                            done
                                            
                                            if [ "$answer" = 'yes' ]; then
                                                npm install
                                            fi
                                        fi
                                        
                                        # this enables some impure stuff like sudo, comment it out to get FULL purity
                                        # export PATH="$PATH:/usr/bin/"
                                        echo
                                        echo "NOTE: if you want to use sudo/git/vim/etc (anything impure) do: sys <that command>"
                                    '';
                                };
                                starship = {
                                    enable = true;
                                    enableZshIntegration = true;
                                    settings = {
                                        character = {
                                            success_symbol = "[∫](bold green)";
                                            error_symbol = "[∫](bold red)";
                                        };
                                    };
                                };
                            };
                        }; 
                    };
                }
    );
}