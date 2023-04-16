function openForm(type) {
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
    default:
    // code block
  }
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}
