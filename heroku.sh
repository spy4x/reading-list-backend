echo "starting heroku.sh script"
ls -la
echo "ls - completed"
cat gulpfile.js
echo "cat gulpfile.js - completed"
yarn global add gulp
echo "yarn global add gulp - completed"
gulp generate-secrets
echo "gulp generate-secrets - completed"
cat build/config/secrets.json
echo "cat build/config/secrets.json - completed"
echo "finishing heroku.sh script"
