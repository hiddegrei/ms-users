const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const { _onRequestWithOptions } = require("firebase-functions/v1/https");
const cors = require("cors")({ origin: true });
const app = express();
app.use(cors);
const admin = require("firebase-admin");
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

admin.initializeApp();

app.get("/api/users/:userId/following/", (req, res) => {
  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .collection("following")

    .get()
    .then((doc) => {
      let docs = [];
      doc
        .forEach((doc, i) => {
          docs[i] = doc.data();
        })
        .then((doc) => {
          res.json({ data: docs });
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/api/users/:userId",urlencodedParser, (req, res) => {
 
  
  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .set({
      username: req.params.userId,
      email: req.body.email,
      userId: req.body.userId,
      imageUrl: "",
      bio: "",
      streak: 0,
      weight: req.body.weight,
      length: req.body.length,
    })
    .then((doc) => {
      res.json({ status: "succes" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: "failed" });
    });;

})

app.get("/api/users/:userId/streak", (req, res) => {
  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .get()
    .then((doc) => {
      console.log(doc.data())
      if (doc.exists) {
        res.json({ streak: doc.data().streak });
      } else {
        res.json({ streak:0,update:true });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
app.put("/api/users/:userId/streak", (req, res) => {
  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .update({
      streak: admin.firestore.FieldValue.increment(1),
    })
    .then((doc) => {
     
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/api/users/:userId/following/:followId", (req, res) => {
  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .collection("following")
    .doc(req.params.followId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.delete("/api/users/:userId/following/:followId", (req, res) => {
  admin
    .firestore()
    .collection("users")
    .doc(`${req.params.userId}/following/${req.params.followId}`)
    .delete()
    .then(() => {
      console.log("Document successfully deleted!");
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
    });
  admin
    .firestore()
    .collection("users")
    .doc(`/${req.params.followId}/followers/${req.params.userId}`)
    .delete()
    .then(() => {
      console.log("Document successfully added!");
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
});

app.post("/api/users/:userId/following/:followId/add", (req, res) => {
  admin
    .firestore()
    .collection("users")
    .doc(`/${req.params.userId}/following/${req.params.followId}`)
    .set({
      username: req.params.followId,
      timestamp: new Date().getTime().toString(),
    })
    .then(() => {
      console.log("Document successfully added!");
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });

  admin
    .firestore()
    .collection("users")
    .doc(`/${req.params.followId}/followers/${req.params.userId}`)
    .set({
      username: req.params.userId,
      timestamp: new Date().getTime().toString(),
    })
    .then(() => {
      console.log("Document successfully added!");
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });

  admin
    .firestore()
    .collection("users")
    .doc(req.params.followId)
    .collection("followersNUM")
    .doc(req.params.followId)
    .update({
      followers: admin.firestore.FieldValue.increment(1),
    })
    .then(() => {
      console.log("followers succesfully updated");
    })
    .catch((error) => console.log(error));

  admin
    .firestore()
    .collection("users")
    .doc(req.params.userId)
    .collection("followingNUM")
    .doc(req.params.userId)
    .update({
      following: admin.firestore.FieldValue.increment(1),
    })
    .then(() => {
      console.log("followers succesfully updated");
    })
    .catch((error) => console.log(error));
});

exports.app = functions.https.onRequest(app);
