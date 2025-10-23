import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { onAuthStateChanged } from "firebase/auth";  //from firebase auth sdk
import { auth } from "./firebaseConfig.js";          //where we defined the "auth" object


//--------------------------------------------------------------
// If you have custom global styles, import them as well:
//--------------------------------------------------------------
import '/src/styles/style.css';

//--------------------------------------------------------------
// Custom global JS code (shared with all pages)can go here.
//--------------------------------------------------------------

// This is an example function. Replace it with your own logic.
function sayHello() {
  // TODO: implement your logic here

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("LOGGED IN as:", user.uid, user.email);
      // e.g., show authed UI
            const nameElement = document.getElementById("name-goes-here"); // the <h1> element to display "Hello, {name}"
            const name = user.displayName || user.email;
            if (nameElement) {
                nameElement.textContent = `${name}!`;
            }
    } else {
      console.log("NOT logged in");
      // e.g., show guest UI
    }
  });

};
document.addEventListener('DOMContentLoaded', sayHello);


