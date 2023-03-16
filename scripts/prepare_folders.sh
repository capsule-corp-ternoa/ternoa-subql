#!/bin/bash

SCRIPT_PATH=$(dirname "$0")
MAIN_DIRECTORY=${SCRIPT_PATH%/*}

folders=($(ls "${MAIN_DIRECTORY}/networks"))

# Get dataSources value from the root project.yaml and store it in a variable
DATASOURCES=$(sed -n '/^dataSources:/,$p' "${MAIN_DIRECTORY}/project.yaml")

for item in ${folders[*]}
do
  CURRENT_DIRECTORY="${MAIN_DIRECTORY}/networks/${item}"

  # Replace the dataSources section in the project.yaml file with the one from the root project.yaml file
  sed -i '' '/^dataSources:/,$d' "${CURRENT_DIRECTORY}/project.yaml" # delete existing dataSources section
  echo "$DATASOURCES" >> "${CURRENT_DIRECTORY}/project.yaml" # add new dataSources section

  scp -r "${MAIN_DIRECTORY}/src" "${CURRENT_DIRECTORY}"
  scp "${MAIN_DIRECTORY}/package.json" "${CURRENT_DIRECTORY}"
  scp "${MAIN_DIRECTORY}/tsconfig.json" "${CURRENT_DIRECTORY}"
  scp "${MAIN_DIRECTORY}/schema.graphql" "${CURRENT_DIRECTORY}"
  scp "${MAIN_DIRECTORY}/local-runner.sh" "${CURRENT_DIRECTORY}"
  scp "${MAIN_DIRECTORY}/docker-compose.yml" "${CURRENT_DIRECTORY}"
done

printf "Done !"
