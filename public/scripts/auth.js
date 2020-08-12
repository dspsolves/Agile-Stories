// // add admin cloud function
// const adminForm = document.querySelector(".admin-actions");
// adminForm.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const adminEmail = document.querySelector("#admin-email").value;
//     const addAdminRole = functions.httpsCallable("addAdminRole");
//     addAdminRole({ email: adminEmail }).then((result) => {
//         console.log(result);
//     });
// });

// listen for auth status changes
auth.onAuthStateChanged((user) => {
    if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
            user.admin = idTokenResult.claims.admin;
            setupUI(user);
        });
        db.collection("projects")
            .where("owner", "==", user.uid)
            .onSnapshot(
                (snapshot) => {
                    setupPrivateProjects(snapshot.docs);
                },
                (err) => {
                    console.log(err.message);
                    setupPrivateProjects([]);
                }
            );
    } else {
        setupUI();
    }
    db.collection("projects")
        .where("visibility", "==", "public")
        .onSnapshot(
            (snapshot) => {
                setupPublicProjects(snapshot.docs);
            },
            (err) => {
                console.log(err.message);
                setupPublicProjects([]);
            }
        );

    db.collection("stories")
        .onSnapshot(
            (snapshot) => {
                setupStories(snapshot.docs);
            },
            (err) => {
                console.log(err.message);
                setupStories([]);
            }
        );
});

// add new project
const projectForm = document.querySelector("#project-form");
projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log();
    db.collection("projects")
        .add({
            name: projectForm.name.value,
            owner: auth.getUid(),
            stories: [],
            members: [],
            visibility: projectForm.visibility.checked ? "public" : "private",
            brief: projectForm.brief.value,
        })
        .then(() => {
            const modal = document.querySelector("#modal-new-project");
            M.Modal.getInstance(modal).close();
            projectForm.reset();
        })
        .catch((err) => {
            console.log(err.message);
        });
});

// create new story
const createForm = document.querySelector("#create-form");
createForm.addEventListener("submit", (e) => {
    e.preventDefault();
    var userN = auth.getUid();
    db.collection("users")
        .doc(userN)
        .get()
        .then(
            (doc) => {
                userN = doc.data().username;
            },
            (err) => console.log(err.message)
        );
    db.collection("stories")
        .add({
            title: createForm.title.value,
            content: {
                persona: createForm.persona.value,
                purpose: createForm.purpose.value,
                requirement: createForm.requirement.value,
            },
            author: userN,
        })
        .then(() => {
            // close the create modal & reset form
            const modal = document.querySelector("#modal-create");
            M.Modal.getInstance(modal).close();
            createForm.reset();
        })
        .catch((err) => {
            console.log(err.message);
        });
});

// signup
const signupForm = document.querySelector("#signup-form");
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get user info
    const email = signupForm["signup-email"].value;
    const password = signupForm["signup-password"].value;

    // sign up the user & add firestore data
    auth.createUserWithEmailAndPassword(email, password)
        .then((cred) => {
            return db.collection("users").doc(cred.user.uid).set({
                bio: signupForm["signup-bio"].value,
            });
        })
        .then(() => {
            // close the signup modal & reset form
            const modal = document.querySelector("#modal-signup");
            M.Modal.getInstance(modal).close();
            signupForm.reset();
            signupForm.querySelector(".error").innerHTML = "";
        })
        .catch((err) => {
            signupForm.querySelector(".error").innerHTML = err.message;
        });
});

// logout
const logout = document.querySelector("#logout");
logout.addEventListener("click", (e) => {
    e.preventDefault();
    auth.signOut();
});

// login
const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // get user info
    const email = loginForm["login-email"].value;
    const password = loginForm["login-password"].value;

    // log the user in
    auth.signInWithEmailAndPassword(email, password)
        .then((cred) => {
            // close the signup modal & reset form
            const modal = document.querySelector("#modal-login");
            M.Modal.getInstance(modal).close();
            loginForm.reset();
            loginForm.querySelector(".error").innerHTML = "";
        })
        .catch((err) => {
            loginForm.querySelector(".error").innerHTML = err.message;
        });
});
