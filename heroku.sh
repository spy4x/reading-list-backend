echo "starting heroku.sh script"
node node_modules/gulp/bin/gulp
echo "gulp - completed"
cat build/config/secrets.json
echo "cat build/config/secrets.json - completed"
echo "finishing heroku.sh script"
