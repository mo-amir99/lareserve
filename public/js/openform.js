function openForm(type, id) {
  switch (type) {
    case "name":
      document.updateForm.action = "update-name";
      document.getElementById("formUserInput").setAttribute("name", "name");
      document.getElementById("form-title").innerHTML = "Update Your Username";
      break;
    case "phone":
      document.updateForm.action = "update-phone";
      document.getElementById("formUserInput").setAttribute("name", "phone");
      document.getElementById("form-title").innerHTML = "Update Your Phone";
      break;
    case "password":
      document.updateForm.action = "update-password";
      document.getElementById("formUserInput").setAttribute("name", "password");
      document.getElementById("form-title").innerHTML = "Update Your Password";
      break;
    case "delete":
      document.updateForm.action = "delete-organization";
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
    default:
  }
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}
