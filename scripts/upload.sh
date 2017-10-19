#!/bin/bash

aws cloudformation package \
    --template-file ./template.yaml \
    --s3-bucket api.conapps.click \
    --output-template-file packaged-template.yaml
