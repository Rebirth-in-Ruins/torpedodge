FROM golang:1.23 AS build-stage
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server main.go 

FROM gcr.io/distroless/static
WORKDIR /
COPY --from=build-stage /server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]
