#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y docker.io docker-compose-v2 git jq awscli
systemctl enable --now docker

install -d -m 0755 /opt/autocare
git clone --branch "${repository_branch}" --single-branch "${repository_url}" /opt/autocare/app

aws ssm get-parameters-by-path \
  --region "${aws_region}" \
  --path "${ssm_parameter_path}" \
  --with-decryption \
  --recursive \
  --output json |
  jq -r '.Parameters[] | "\(.Name | split("/")[-1])=\(.Value | @json)"' \
  > /opt/autocare/app/.env

cd /opt/autocare/app
docker compose up -d --build

