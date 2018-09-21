
var addNameText = document.getElementById("addNameText");
var addPersonSubmitBtn = document.getElementById("addPersonSubmitBtn");
var addResturantText = document.getElementById("addResturantText");
var addResturantSubmitBtn = document.getElementById("addResturantSubmitBtn");
var resturantSelectionByUser = null;

document.getElementById("date").innerHTML = getTodaysDate();
var groupUserEmail = "";
var userNameAuth = document.getElementById("addGroupUserNameText");




//retrive addNameText on refresh
if (sessionStorage.getItem("autosaveNameText")) {
  // Restore the contents of the text addNameText
  addNameText.value = sessionStorage.getItem("autosaveNameText");
  document.getElementById("passedName").innerHTML = addNameText.value;

}

if (sessionStorage.getItem("autosaveUserNameAuth")) {
  
  userNameAuth.value = sessionStorage.getItem("autosaveUserNameAuth");

}
 
// Listen for changes in addNameText
addNameText.addEventListener("change", function() {
  // And save the results into the session storage object
  sessionStorage.setItem("autosaveNameText", addNameText.value);
});

userNameAuth.addEventListener("change", function() {
  // And save the results into the session storage object
  sessionStorage.setItem("autosaveUserNameAuth", userNameAuth.value);
});

//checks if logged in
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    
	document.getElementById("loggedInDiv").style.display = "block";
	document.getElementById("notLoggedInDiv").style.display = "none";
	
  } else {
    
	document.getElementById("loggedInDiv").style.display = "none";
	document.getElementById("notLoggedInDiv").style.display = "block";
	
  }
});

function getTodaysDate(){
	n =  new Date();
	y = n.getFullYear();
	m = n.getMonth() + 1;
	d = n.getDate();
	var todaysDate = m + "/" + d + "/" + y;	
	return todaysDate;
}

//add a person to web app
function submitPerson(userResturantSelection){
	var nameText = addNameText.value;	
	usersRef = firebase.database().ref().child(document.getElementById("addGroupUserNameText").value +"/user/")
	usersRef.child(nameText).set({
		name: nameText,
		resturantName: userResturantSelection,
		date: getTodaysDate()
		
	});
	
}

//add a resturant to web app
function submitResturant(){
	var resturantText = addResturantText.value;	
	var resturantsRef = firebase.database().ref().child(document.getElementById("addGroupUserNameText").value+"/resturant/");
	resturantsRef.child(resturantText).set({
		name: resturantText
	});
	
}

//executed when an individual selects a resturant calls submitPerson
function saveResturantSelection(element) {
    
	
	resturantSelectionByUser = element.value;
	submitPerson(resturantSelectionByUser);
}

function removeData(nameToBeDeleted) {
    
	firebase.database().ref().child(document.getElementById("addGroupUserNameText").value +"/user/"+nameToBeDeleted+"/").remove();
	var indexOfDataToRemove = getRow(nameToBeDeleted);
	if(indexOfDataToRemove != -1)
	{
		document.getElementById("userTable").deleteRow(indexOfDataToRemove);
	}
}

function getRow(passedName){

	var x = document.getElementsByTagName("tr");
    var i;
    for (i = 0; i < x.length;i++) {
		if(document.getElementById("userTable").rows[i].cells[0].innerHTML == passedName)
		{
			return i;
		}
        
    }
    return -1;
}

function getEmail(userNamePassed){
	
	var ref = firebase.database().ref().child("login");
	ref.orderByChild("userName").equalTo(userNamePassed).once("value").then( function(snapshot) {
		var userData = snapshot.val();
		if(userData)
		{
			
			snapshot.forEach(function (childSnapshot) {

				var value = childSnapshot.val();
				groupUserEmail = value.email;
			});
		}

	});
	
	
}



function login(userNamePassed){

	userNameAuth = userNamePassed;
	var groupPassword = addGroupPasswordText.value;
	var ref = firebase.database().ref().child("login");
	ref.orderByChild("userName").equalTo(userNamePassed).once("value").then( function(snapshot) {
		var userData = snapshot.val();
		if(userData)
		{
			glb = snapshot.val();
			snapshot.forEach(function (childSnapshot) {

				var value = childSnapshot.val();
				groupUserEmail = value.email;
			});
			
		}
		firebase.auth().signInWithEmailAndPassword(groupUserEmail, groupPassword).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		window.alert("Either the password or groupusername is incorrect");
		// ...
	});
		document.getElementById("passedName").innerHTML = addNameText.value;
		var user = firebase.auth().currentUser;
		var userEmail ="";
		var userUid = "";
		if (user != null) {
			userEmail = user.email;
			userUid = user.uid;
		}
	});

	

}

function logout(){
	
	firebase.auth().signOut().then(function() {
		addGroupPasswordText.value  = "";
		// Sign-out successful.
	}).catch(function(error) {
		// An error happened.
	});
	
	
}


//retives all the resturant from DB when they are added

var resturantsRefSub = firebase.database().ref().child(document.getElementById("addGroupUserNameText").value+"/resturant/");
var counter = 0;
resturantsRefSub.on('child_added', function(data) {
	
	var resturantNameDB = data.child("name").val();
	var emailDB = data.child("email").val();

	if(counter == 2)
	{
		counter = 0;
		$("#table_bodyResturant").append("<td><button class = 'mdl-chip' id='resturantRow' value=" + "'"+resturantNameDB+"'" + " onclick=" + "saveResturantSelection(this)" +"><span class='mdl-chip__text'>"+resturantNameDB+"</span></button></td>");
		$("#table_bodyResturant").append("<tr></tr>");
	}
	else
	{
		$("#table_bodyResturant").append("<td><button class = 'mdl-chip' id='resturantRow'  value=" + "'"+resturantNameDB+"'" + " onclick=" + "saveResturantSelection(this)" +"><span class='mdl-chip__text'>"+resturantNameDB+"</span></button></td>");
		counter++;
	}
	addResturantText.value = "";

});

//retrives all the people from DB when they are added

var usersRefSub = firebase.database().ref().child(document.getElementById("addGroupUserNameText").value+"/user");
usersRefSub.on('child_added', function(data) {
  
	var nameDB = data.child("name").val();
	var dateDB = data.child("date").val();
	var resturantNameDB = data.child("resturantName").val();
	var emailDB = data.child("email").val();
	if(dateDB == getTodaysDate())
	{
		
		$("#table_body").append("<tr><td class='mdl-data-table__cell--non-numeric'>" + nameDB + "</td><td class='mdl-data-table__cell--non-numeric'>" + resturantNameDB + "</td><td><button class='mdl-button mdl-js-button mdl-button--icon' onClick = removeData('"+nameDB+"')><i class='material-icons'>delete_forever</i></button></td></tr>");
	
	}
	else
	{
		removeData(nameDB);
	}
});


//listens when person is updated

var usersRefSub = firebase.database().ref().child(document.getElementById("addGroupUserNameText").value+"/user");
usersRefSub.on('child_changed', function(data) {

	var nameDB = data.child("name").val();
	//if individual already exsists need to remove old one
	if(getRow(nameDB) != -1)
	{
		document.getElementById("userTable").deleteRow(getRow(nameDB));
	}
	var resturantNameDB = data.child("resturantName").val();
	$("#table_body").append("<tr><td class='mdl-data-table__cell--non-numeric'>" + nameDB + "</td><td class='mdl-data-table__cell--non-numeric'>" + resturantNameDB + "</td><td><button class='mdl-button mdl-js-button mdl-button--icon' onClick = removeData('"+nameDB+"')><i class='material-icons'>delete_forever</i></button></td></tr>");
});



