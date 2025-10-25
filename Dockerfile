FROM docker.io/electronuserland/builder:22-wine-03.25

RUN apt-get update
RUN apt-get install -y curl git sudo

# Environment variables required by Nix
ENV USER=root
ENV NIX_INSTALL_URL=https://nixos.org/nix/install

# Install Nix
# RUN curl -L "$NIX_INSTALL_URL" | sh . /root/.nix-profile/etc/profile.d/nix.sh
# RUN curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install --no-confirm
RUN sudo sh -c 'apt update -qq && apt install -y -qq acl && setfacl -k /tmp'
# NOTE: 2.31.2
RUN curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix/tag/v3.11.3 | sh -s -- install linux \
  --extra-conf "sandbox = false" \
  --extra-conf "filter-syscalls = false" \
  --init none \
  --no-confirm \
  --determinate

RUN sudo -n sh -c '. /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh; nohup /nix/var/nix/profiles/default/bin/nix-daemon > /tmp/nix-daemon.log 2>&1 &'

# added determinate option
ENV PATH="${PATH}:/nix/var/nix/profiles/default/bin"

# pin the nixpkgs version
ENV NIX_PATH=nixpkgs=https://github.com/NixOS/nixpkgs/archive/refs/tags/25.05.tar.gz

# Add nix.sh sourcing to every shell
RUN echo ". /root/.nix-profile/etc/profile.d/nix.sh" >> /root/.bashrc

RUN apt install -y dbus
RUN mkdir -p /run/dbus
RUN dbus-daemon --system

COPY ./flake.nix ./
COPY ./flake.lock ./
RUN nix profile add '.#electron'
RUN nix profile add '.#nodejs'

# Set the working directory
WORKDIR /project

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY ./.*ignore ./
COPY ./main ./main
COPY ./run ./run

# Run the build
CMD ["run/build"]
# CMD ["bash"]
