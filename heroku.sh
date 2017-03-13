echo "starting heroku.sh script"
node node_modules/gulp/bin/gulp generate-secrets
echo "gulp generate-secrets - completed"
cat build/config/secrets.json
echo "cat build/config/secrets.json - completed"
echo "finishing heroku.sh script"
