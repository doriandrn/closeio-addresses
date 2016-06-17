# close.io - Addresses Modal
## To run the app:

Change working directory in terminal to '_sources/4_code/'
``` npm install ```

Please make sure your no other app is using your 3000 port on localhost.
``` npm run server ```

Wait for message:
``` webpack: bundle is now VALID. ``` 

URL to access the app:
``` http://localhost:3000 ```

Side notes: 
- HTTP logger is activated to trace request / response methods ( and URIs );
- If there are any issues throughout the compilation process, please make sure you have the lastet version of Node ( 4.4.5+ ) and npm ( 2.15.5+ );
- An internet connection is required;
- Server connects to a public mongo database - if requests happen to be slow sometimes. 