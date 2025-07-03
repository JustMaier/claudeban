FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    gnupg \
    lsb-release \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install .NET SDK 8.0
RUN wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --version 8.0.100 \
    && rm dotnet-install.sh

ENV DOTNET_ROOT=/root/.dotnet
ENV PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools

# Install WASI workload
RUN $DOTNET_ROOT/dotnet workload install wasi-experimental

# Install SpacetimeDB
RUN curl -sSf https://install.spacetimedb.com | bash
ENV PATH=$PATH:/root/.spacetimedb/bin

# Create workspace directory
WORKDIR /workspace

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose SpacetimeDB ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD spacetime list || exit 1

ENTRYPOINT ["/entrypoint.sh"]