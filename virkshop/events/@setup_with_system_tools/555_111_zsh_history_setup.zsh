# setup history
export HISTFILE="$HOME/.zsh_history"
export SAVEHIST=10000  # Save most-recent 1000 lines
touch "$HISTFILE"
setopt inc_append_history share_history