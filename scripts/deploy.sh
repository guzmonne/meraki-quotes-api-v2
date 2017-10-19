#!/bin/bash

aws s3 cp swagger.yaml s3://api.conapps.click/swagger.yaml

aws cloudformation deploy \
    --template-file ./packaged-template.yaml \
    --stack-name meraki-quotes-v2 \
    --capabilities CAPABILITY_IAM
