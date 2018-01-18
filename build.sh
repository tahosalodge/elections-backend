#! /bin/bash
NAME=mckernanin/elections-api
TAG=$(git log -1 --pretty=%h)
IMG=$NAME:$TAG
LATEST=$NAME:latest
docker build -t $IMG .
docker push $IMG
