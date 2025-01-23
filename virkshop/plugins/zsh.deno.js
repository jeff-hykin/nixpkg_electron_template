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
        ...pluginSettings,
    },
    commands: {
    },
    events: {
        async '@setup_with_system_tools/zsh_ps1'() {
            return [`
                DISABLE_AUTO_UPDATE="true"
                DISABLE_UPDATE_PROMPT="true"

                #
                # enable comments
                #
                setopt interactivecomments

                unalias -m '*' # remove all default aliases
                precmd_functions=""
                
                # autoload -Uz compinit
                # compinit
                
                # Custom prompt (other prompts cause problems for some reason)
                autoload -U promptinit; promptinit
                _prompt_help__simple_pwd() {
                    local maybe_relative_to_home="\${PWD/#"$HOME"/"~"}"
                    if [ -d ".git" ]
                    then
                        local path_to_file=""
                        local dir_name=".git"
                        local folder_to_look_in="$PWD"
                        while :
                        do
                            # check if file exists
                            if [ -d "$folder_to_look_in/$dir_name" ]
                            then
                                path_to_file="$folder_to_look_in"
                                break
                            else
                                if [ "$folder_to_look_in" = "/" ]
                                then
                                    break
                                else
                                    folder_to_look_in="$(dirname "$folder_to_look_in")"
                                fi
                            fi
                        done
                        if [ -z "$path_to_file" ]
                        then
                            # fallback
                            echo "$maybe_relative_to_home"
                        else
                            # git path
                            echo "$(basename "$path_to_file")"
                        fi
                        # basename "$PWD"
                    else
                        echo "$maybe_relative_to_home"
                    fi
                }
                _prompt_help__git_status() {
                    # if git exists
                    if [ -n "$(command -v "git")" ]
                    then
                        echo "  $(git rev-parse --abbrev-ref HEAD) "
                    fi
                }
                _prompt_help__python_if_available() {
                    if [ -n "$(command -v "python")" ]
                    then
                        local version_string="$(python --version)"
                        echo "Python:\${version_string/#Python /}%u  "
                    fi
                }
                _prompt_help__deno_if_available() {
                    if [ -n "$(command -v "deno")" ]
                    then
                        local version_string="$(deno --version)"
                        echo "Deno:$(deno --version | sed -E 's/deno ([0-9]+\\.[0-9]+\\.[0-9]+).+/\\1/' | head -n1)%u  "
                    fi
                }

                _prompt_help__updater () {
                    _prompt_help__simple_pwd__output="$(_prompt_help__simple_pwd)"
                    _prompt_help__git_status__output="$(_prompt_help__git_status)"
                    _prompt_help__python_if_available__output="$(_prompt_help__python_if_available)"
                    _prompt_help__deno_if_available__output="$(_prompt_help__deno_if_available)"
                    _prompt_help__date__output="$(date +%H:%M:%S)"
                    export PS1="
%F{cyan}%F{153}$_prompt_help__simple_pwd__output%F{magenta}$_prompt_help__git_status__output %B|%f  %U%F{blue}$_prompt_help__deno_if_available__output%U%F{green}$_prompt_help__python_if_available__output%F{black}-- $_prompt_help__date__output
%F{254}%F{green}%B>%f%u "
                }
                precmd_functions+=(_prompt_help__updater)
            `]
        },
    },
    methods: {
    },
})