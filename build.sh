#!/bin/sh

mkdir foundation
cd foundation
curl http://foundation.zurb.com/sites/download.html/complete > foundation.zip
unzip foundation.zip
curl http://zurb.com/playground/uploads/upload/upload/288/foundation-icons.zip > foundation-icons.zip
unzip foundation-icons.zip
rm foundation.zip foundation-icons.zip index.html

cd ..
curl https://codeload.github.com/facebook/php-graph-sdk/zip/5.0.0 > fb-sdk.zip
unzip fb-sdk.zip
rm fb-sdk.zip

echo Enter APP ID:
read LINE1;

echo Enter APP SECRET:
read LINE2;

echo '<?php' > config.php
echo 'define("APP_ID", '\"${LINE1}\"');' >> config.php
echo 'define("APP_SECRET", '\"${LINE2}\"');' >> config.php
echo '?>' >> config.php
