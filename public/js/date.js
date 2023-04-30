let field = document.querySelector("#date");

date.addEventListener("input", function () {
  let date = field.value;
  window.location.href = window.location.href.split("/")[0] + "?date=" + date;
});
