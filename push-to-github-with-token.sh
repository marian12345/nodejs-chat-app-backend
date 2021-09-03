#!/bin/bash
echo "your github username:\n"
read github_username
echo "your github repository name:\n"
read repository_name
echo "Your Github Access Token:\n"
read github_access_token

echo "attempting to git push..."

git push https://$github_access_token@github.com/$github_username/$repository_name.git


