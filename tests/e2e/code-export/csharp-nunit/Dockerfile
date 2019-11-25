FROM microsoft/dotnet:3.0-sdk
RUN mkdir /runner
WORKDIR /runner
COPY tests/project.csproj .
RUN dotnet restore project.csproj
