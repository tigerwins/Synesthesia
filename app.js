document.addEventListener("DOMContentLoaded", () => {
  const question = document.getElementById("question");
  const enter = document.getElementById("enter");
  const modal = document.querySelector(".landing-page");

  enter.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  question.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

});
