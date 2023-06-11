# Social

Social is a simple mobile application which allows users creating posts and comments, make reaction for the actions other customers.

## Getting started

 - For launching social app on mobile device you need to install the expo go.  You can download it from play market on android device or app store from ios device. After installing expo i need open it and enter link exp://exp.host/@mihail18071983/social?release-channel=default.
 - For launching social app on desktop you need:
 1. Open your IDE.
 2. clone repo from github using git cline https://github.com/Mihail18071983/react-native-social.git on your pc.
 3. Install the Expo Client app on your desktop. You can download it from the Expo website: https://expo.io/tools#client
 4. set up dependencies using npm install or expo install.
 5. Run the application using npm start or expo start.
 6. Scan the qr code which appears in your terminal.


## Usage 

 After launching app you redirect to the registration screen. For using app you need to register. Enter your valid name, email and password and press Sign up. You also can assign avatar but it's not nessesary. You can do it later. If you have already had an account you can press "Log in" below the "Sign up" button and you will be redirected to the login screen. 
 After successful authentication you redirect to the Profile screen. You can assign avatar or change it. In profile screen your personal posts will be stored. 
 If you want creating your personal post you should move to the Create posts screen in bottom tab pressing "+". For creating photo you can press by button "Create Photo" and camera will appears. You can crete photo by camera or dowloading it from storage with mobile device on your choice. Then you must set name of your photo and location. You can set location manually or press by location icon and it will be applied. You also have an oportunity to delete photo before submiting.
 You can move to the Posts screen  by clicking icon <img src="./assets/images/grid.png" alt="grid image"/>.
 In this screen you can watch all users posts. You can add comment to the any post by clicking ![comments](./assets/images/message-circle.png). Then you will be redirected to the comment screen where you could add comment. For returning to the posts screen you need clicking by ![back](./assets/images/arrow-left.png).
 For logging out you need clicking by ![Log out image][def]

[def]: ./assets/images/log-out.png

## Technologies 

Social application was created with expo react-native. As a state managment redux-toolkit was used. Users data was kept in firebase firestore.

