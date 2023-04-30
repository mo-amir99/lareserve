let field = document.querySelector("#date");

// Handle date changes
date.addEventListener("input", function () {
  let date = field.value;
  window.location.href = "/schedule?date=" + date;
});
