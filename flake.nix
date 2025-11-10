{
    description = "electron_template";
    inputs = {
        flake-utils.url = "github:numtide/flake-utils";
        lib.url = "github:jeff-hykin/quick-nix-toolkits";
        lib.inputs.flakeUtils.follows = "flake-utils";
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
        home-manager.url = "github:nix-community/home-manager/release-25.05";
        home-manager.inputs.nixpkgs.follows = "nixpkgs";
        xome.url = "github:jeff-hykin/xome";
        xome.inputs.nixpkgs.follows = "nixpkgs";
        xome.inputs.home-manager.follows = "home-manager";
    };
    outputs = { self, lib, nixpkgs, xome, ... }:
        lib.eachSystem lib.defaultSystems (system:
            let
                builtins = lib.builtins;
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
                pkgJson = lib.readJson ./package.json;
                devInputs = lib.aggregator [
                    # project info
                    { vals.config = { name=pkgJson.name; version=pkgJson.version; }; }
                    
                    # main packages
                    { vals.pkg=pkgs.android-tools; }
                    { vals.pkg=pkgs.esbuild; }
                    { vals.pkg=pkgs.zip;     }
                    { vals.pkg=pkgs.unzip;   }
                    { vals.pkg=pkgs.less;    }
                    {
                        vals.pkg=pkgs.nodejs;
                        vals.devShellHook = ''
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
                        '';
                    }
                    
                    # 
                    # Linux stuff
                    # 
                    { vals.pkg=pkgs.gcc;        onlyIf=pkgs.stdenv.isLinux; }
                    { vals.pkg=pkgs.dpkg;       onlyIf=pkgs.stdenv.isLinux; }
                    { vals.pkg=pkgs.fakeroot;   onlyIf=pkgs.stdenv.isLinux; }
                    { vals.pkg=pkgs.rpm;        onlyIf=pkgs.stdenv.isLinux; }
                    { vals.pkg=pkgs.pkg-config; onlyIf=pkgs.stdenv.isLinux; }
                    
                    # main inputs (sections below this, ex: dbus, are discovered from stuff like atk)
                    { vals.pkg=pkgs.atk.dev;                          onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.gdk-pixbuf.dev;                   onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.gtk3.dev;                         onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.pango.dev;                        onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libayatana-appindicator-gtk3.dev; onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.glib.dev;                         onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    
                    # discovered needed inputs
                    { vals.pkg=pkgs.dbus.dev;             onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libpng.dev;           onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libjpeg.dev;          onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libtiff.dev;          onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.cairo.dev;            onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.fribidi.dev;          onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.fontconfig.dev;       onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.harfbuzz.dev;         onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libthai.dev;          onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.freetype.dev;         onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.xorg.libXrender.dev;  onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.xorg.libXft.dev;      onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.zlib;                 onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.zlib.dev;             onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libffi.dev;           onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libselinux.dev;       onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.expat.dev;            onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.graphite2.dev;        onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.bzip2.dev;            onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.lerc.dev;             onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libsepol.dev;         onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    
                    # libs not even on the list, but needed at link time 
                    { vals.pkg=pkgs.json-glib;      onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libselinux;     onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.wayland;        onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libjson;        onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.tinysparql;     onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.tinysparql.dev; onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.json-glib.dev;  onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.libselinux.dev; onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    { vals.pkg=pkgs.wayland.dev;    onlyIf=pkgs.stdenv.isLinux; flags.forPkgConfig=true; }
                    
                    # on linux, everthing for pkg-config needs to be added to PKG_CONFIG_PATH, LIBRARY_PATH, etc
                    ({ prevVals, prevAttrsets, mergedVals, getAll, errorIndex }:
                        let 
                            pkgsForPkgConfigTool = getAll { hasAllFlags = ["forPkgConfig"]; attrPath = [ "pkg" ]; };
                        in
                            {
                                onlyIf=pkgs.stdenv.isLinux;
                                vals.shellHook = ''
                                    export PKG_CONFIG_PATH=${lib.escapeShellArg (builtins.concatStringsSep ":" (map (x: "${x}/lib/pkgconfig") pkgsForPkgConfigTool))}
                                    export LD_LIBRARY_PATH=${lib.escapeShellArg (builtins.concatStringsSep ":" (map (x: "${x}/lib") pkgsForPkgConfigTool))}
                                    export LIBRARY_PATH=${lib.escapeShellArg (builtins.concatStringsSep ":" (map (x: "${x}/lib") pkgsForPkgConfigTool))}
                                '';
                            }
                    )
                    
                    # 
                    # devshell stuff
                    # 
                    
                    # core 
                    { vals.devShellPkg=pkgs.coreutils-full;     }
                    {
                        vals.devShellPkg=pkgs.dash;
                        # provide "sh" cause lots of things need sh
                        vals.devShellHook = ''
                            ln -s "$(which dash)" "$HOME/.local/bin/sh" 2>/dev/null
                        '';
                    }
                    # optional but handy dev-shell stuff
                    { vals.devShellPkg=pkgs.gnugrep;            }
                    { vals.devShellPkg=pkgs.findutils;          }
                    { vals.devShellPkg=pkgs.wget;               }
                    { vals.devShellPkg=pkgs.curl;               }
                    { vals.devShellPkg=pkgs.unixtools.locale;   }
                    { vals.devShellPkg=pkgs.unixtools.more;     }
                    { vals.devShellPkg=pkgs.unixtools.ps;       }
                    { vals.devShellPkg=pkgs.unixtools.getopt;   }
                    { vals.devShellPkg=pkgs.unixtools.ifconfig; }
                    { vals.devShellPkg=pkgs.unixtools.hostname; }
                    { vals.devShellPkg=pkgs.unixtools.ping;     }
                    { vals.devShellPkg=pkgs.unixtools.hexdump;  }
                    { vals.devShellPkg=pkgs.unixtools.killall;  }
                    { vals.devShellPkg=pkgs.unixtools.mount;    }
                    { vals.devShellPkg=pkgs.unixtools.sysctl;   }
                    { vals.devShellPkg=pkgs.unixtools.top;      }
                    { vals.devShellPkg=pkgs.unixtools.umount;   }
                    { vals.devShellPkg=pkgs.git;                }
                    { vals.devShellPkg=pkgs.htop;               }
                    { vals.devShellPkg=pkgs.ripgrep;            }
                ];
                buildInputs = devInputs.getAll { attrPath = [ "pkg" ]; };
                shellHook   = devInputs.getAll { attrPath = [ "shellHook" ]; strJoin = "\n"; };
                devShellInputs = buildInputs ++ (devInputs.getAll { attrPath = [ "devShellPkg" ]; });
                devShellHook   = shellHook   +   devInputs.getAll { attrPath = [ "devShellHook" ]; strJoin = "\n"; };
            in
                {
                    # this is how the package is built (as a dependency)
                    packages.default = pkgs.stdenv.mkDerivation (devInputs.mergedVals.config // {
                        src = ./.;

                        buildInputs = buildInputs;

                        buildPhase = ''
                            export HOME=$(mktemp -d) # Needed by npm to avoid global install warnings
                            ${shellHook}
                            npm install
                            npx electron-forge package
                        '';
                        
                        desktopItem = pkgs.makeDesktopItem {
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
                    });
                    
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
                            home.homeDirectory = "/tmp/virtual_homes/${devInputs.mergedVals.config.name}";
                            home.stateVersion = "25.05";
                            home.packages = devShellInputs;
                            
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
                                        ${devShellHook}
                                        
                                        setopt interactivecomments
                                        
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