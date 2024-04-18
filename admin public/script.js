const db = firebase.firestore();

const userCollection = "User"
const userKeyName = "name"

const userList = document.getElementById('user-list');

const addUserForm = document.getElementById('add-user-form');
const updateUserNameForm = document.getElementById('update-user-name-form');

addUserForm.addEventListener('submit', (e) => {
    e. preventDefault();
    db.collection (userCollection).add ({
        name: addUserForm.name.value
    })
    addUserForm.name.value = "";
})

// create element and render user
function renderUser(doc) {
    let li = document.createElement('p');
    let name = document.createElement('span');
    let cross = document.createElement('div');
    let updateData = document.createElement('div');

    li.setAttribute('data-id', doc.id)
    name.textContent = doc.data().name
    cross.textContent = ' - delete data - ';
    updateData.textContent = ' - update data - ';

    li.appendChild(name);
    li.appendChild(cross);
    li.appendChild(updateData);

    userList.appendChild(li)

    // delete data
    cross.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection(userCollection).doc(id).delete();
    })

    // update data | Warning Not Real Time
    updateData.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection(userCollection).doc(id).update({
            name : updateUserNameForm.name.value
        });
        updateUserNameForm.name.value = "";
    })
}

function updateDataInListItem(li, updatedData) {
    // Get the existing name element
    const nameElement = li.querySelector('span');

    // Update the name content
    nameElement.textContent = updatedData.name;
}

// get data (normal)
// db.collection(userCollection).get().then((querySnapshot) => {
//     querySnapshot.docs.forEach(doc => {
//         renderUser(doc)
//     });
// });


//// perform specific query
// db.collection(userCollection).where(`${key}`, 'compare logic (<, ==, >)', 'desired operator (0-9 or a-z)' ).get().then((querySnapshot) => {
//     querySnapshot.docs.forEach(doc => {
//         // console.log(doc);
//         console.log(doc.data());
//         renderUser(doc)
//     });
// });

//// ordering data
// db.collection(userCollection).orderBy(`${key}`).get().then((querySnapshot) => {
//     querySnapshot.docs.forEach(doc => {
//         // console.log(doc);
//         console.log(doc.data());
//         renderUser(doc)
//     });
// });


//// creating complex query might have to set up query index in firestore -> https://www.youtube.com/watch?v=cb8H_hp10rc&list=PL4cUxeGkcC9itfjle0ji1xOZ2cjRGY_WB&index=7
// db.collection(userCollection).where(`${key}`, 'compare logic (<, ==, >)', 'desired operator (0-9 or a-z)' ).orderBy(`${key}`).get().then((querySnapshot) => {
//     querySnapshot.docs.forEach(doc => {
//         // console.log(doc);
//         console.log(doc.data());
//         renderUser(doc)
//     });
// });

//// realtime database | Read data and adjust data when the firestore data changed

db.collection(userCollection).orderBy(userKeyName).onSnapshot (snapshot => {
    let changes = snapshot.docChanges();
    console.log(changes)
    changes.forEach(change => {
        if(change.type == 'added' ) renderUser(change.doc);
        else if (change.type == 'removed' ) {
            let li = userList.querySelector('[data-id=' + change.doc.id + ']');
            if (li) userList.removeChild(li);
        }
        else if (change.type == 'modified' ) {
            let li = userList.querySelector('[data-id=' + change.doc.id + ']');
            if (li) updateDataInListItem(li, change.doc.data());
        }
    })
})


// auth script
const loginAdmin = document.getElementById('login-admin');
const loginHotel = document.getElementById('login-hotel');

var provider = new firebase.auth.GoogleAuthProvider();

var user;


const hotelCollection = "Hotel"
loginAdmin.addEventListener('click', (e) => {
    firebase.auth().signInWithPopup(provider).then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;
    
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = credential.accessToken;
        // The signed-in user info.
        user = result.user;
        // IdP data available in result.additionalUserInfo.profile.
        // ...

        console.log("Sucess")
        console.log(user)
        
        console.log(`user.displayName : ${user.displayName}`)
        console.log(`user.email : ${user.email}`)
        console.log(`user.uid : ${user.uid}`)
        console.log(`user.photoURL : ${user.photoURL}`)

        var existingUser

        // firebase auth add firestore data guide
        db.collection(hotelCollection).doc(user.uid).get().then((querySnapshot) => {
            if (querySnapshot.exists) console.log("Hotel user already exist :", querySnapshot.data());
            else {
                db.collection(hotelCollection).doc(user.uid).set({
                    name: user.displayName,
                    email: user.email
                }).then(() => {
                    console.log("New hotel data added for user!");
                }).catch((error) => {
                    console.error("Error adding hotel data:", error);
                });
            }
        });
        
    }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...

        console.log(`error : ${errorMessage}`)
    });
    
})