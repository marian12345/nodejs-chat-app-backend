#!/bin/bash
dirname=$(pwd)
repository_name="${dirname%"${dirname##*[!/]}"}" # extglob-free multi-trailing-/ trim
repository_name="${repository_name##*/}" 
echo "repository name:\n"
echo $repository_name

echo "your github username:\n"
read github_username
echo "Your Github Access Token:\n"
read github_access_token

echo "attempting to git push..."

git push https://$github_access_token@github.com/$github_username/$repository_name.git


