echo "starting heroku.sh script"
ls -la
echo "ls -la - completed"
ls -la node_modules
echo "ls -la node_modules - completed"
node node_modules/gulp/bin/gulp.js
echo "gulp - completed"
cat build/config/secrets.json
echo "cat build/config/secrets.json - completed"
echo "finishing heroku.sh script"
