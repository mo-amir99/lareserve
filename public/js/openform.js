function openForm(type, id, cId, date, members) {
  switch (type) {
    case "name":
      document.updateForm.action = "/update-name";
      document.getElementById("formUserInput").setAttribute("name", "name");
      document.getElementById("form-title").innerHTML = "Update Your Username";
      break;
    case "phone":
      document.updateForm.action = "/update-phone";
      document.getElementById("formUserInput").setAttribute("name", "phone");
      document.getElementById("form-title").innerHTML = "Update Your Phone";
      break;
    case "password":
      document.updateForm.action = "/update-password";
      document.getElementById("formUserInput").setAttribute("name", "password");
      document.getElementById("form-title").innerHTML = "Update Your Password";
      break;
    case "delete":
      document.updateForm.action = "/delete-organization";
      document.getElementById("orgId").value = id;
      document.getElementById("formUserInput").hidden = true;
      document.getElementById("form-title").innerHTML =
        "Are you sure you want to delete this organization?";
      document.getElementById("actionButton").innerHTML = "Delete";
      break;
    case "sub":
      document.getElementById("form-title").innerHTML =
        "Please contact support in order to change your subscription plan";
      document.getElementById("formUserInput").hidden = true;
      document.getElementById("actionButton").hidden = true;
      document.getElementById("closeButton").innerHTML = "Ok";
      break;
    case "deleteChamber":
      document.updateForm.action = "/delete-chamber";
      document.getElementById("chamberId").value = cId;
      document.getElementById("orgId").value = id;
      document.getElementById("input2").hidden = true;
      document.getElementById("input2title").hidden = true;
      document.getElementById("formUserInput").hidden = true;
      document.getElementById("form-title").innerHTML =
        "Are you sure you want to delete this chamber?";
      document.getElementById("actionButton").innerHTML = "Delete";
      break;
    case "updateChamber":
      document.updateForm.action = "/update-chamber";
      document.getElementById("chamberId").value = cId;
      document.getElementById("orgId").value = id;
      document.getElementById("input2").hidden = false;
      document.getElementById("input2title").hidden = false;
      document.getElementById("formUserInput").hidden = false;
      document.getElementById("input2title").innerHTML = "Update capacity";
      document.getElementById("formUserInput").setAttribute("name", "name");
      document.getElementById("form-title").innerHTML = "Update name";
      document.getElementById("actionButton").innerHTML = "Update";
      break;
    case "updateChamberMembers":
      document.updateForm.action = "/update-chamber-members";
      document.getElementById("chamberId").value = cId;
      document.getElementById("orgId").value = id;
      document.getElementById("selectedDate").value = date;
      // document.getElementById("formUserInput").value = members.toString();
      document.getElementById("formUserInput").setAttribute("name", "members");
      document.getElementById("form-title").innerHTML =
        "Add new emails separated by commas, Example: john@gmail.com, ahmed@yahoo.com";
      document.getElementById("actionButton").innerHTML = "Update";
      document.getElementById("from").hidden = false;
      document.getElementById("to").hidden = false;
      document.getElementById("fromtxt").hidden = false;
      document.getElementById("totxt").hidden = false;
      break;
    case "sendEmail":
      document.updateForm.action = "/send-email";
      document.getElementById("chamberId").value = cId;
      document.getElementById("orgId").value = id;
      document.getElementById("selectedDate").value = date;
      document.getElementById("members").value = members;
      document.getElementById("formUserInput").hidden = true;
      document.getElementById("chambers").hidden = true;
      document.getElementById("form-title").innerHTML =
        "Send Email Notification?";
      document.getElementById("actionButton").innerHTML = "Send";
      break;
    case "removeUser":
      document.updateForm.action = "/remove-user";
      document.getElementById("chamberId").value = cId;
      document.getElementById("orgId").value = id;
      document.getElementById("selectedDate").value = date;
      document.getElementById("members").value = members;
      document.getElementById("formUserInput").hidden = true;
      document.getElementById("chambers").hidden = true;
      document.getElementById("form-title").innerHTML = "Are you sure ?";
      document.getElementById("actionButton").innerHTML = "Yes";
      break;
    case "copySch":
      document.updateForm.action = "/copySch";
      document.getElementById("chamberId").value = cId;
      document.getElementById("orgId").value = id;
      document.getElementById("selectedDate").value = date;
      document.getElementById("members").value =
        document.getElementById("chambers").value;
      document.getElementById("formUserInput").hidden = true;
      document.getElementById("chambers").hidden = false;
      document.getElementById("form-title").innerHTML =
        "Choose a chamber to copy to";
      document.getElementById("actionButton").innerHTML = "Copy";
      break;
    default:
  }
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
  document.getElementById("formUserInput").value = "";
  document.getElementById("input2").value = "";
}
