FROM golang:alpine3.14 as builder

WORKDIR /go/src/golend/backend

RUN go mod init

COPY . .     

RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build 

FROM alpine:3.14
WORKDIR /app 

COPY --from=builder /go/src/golend/backend/backend .

EXPOSE 8000 
CMD ["./test"]

