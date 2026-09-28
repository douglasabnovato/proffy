/* Duplica o bloco de horário com ids únicos para manter rótulos associados */
(function () {
  const container = document.querySelector("#schedule-items");
  const errorHint = document.querySelector("#erro-schedule");

  /* Clona o primeiro horário, limpa os valores e ajusta ids/for */
  function cloneField() {
    const items = container.querySelectorAll(".schedule-item");
    const index = items.length;
    const clone = items[0].cloneNode(true);
    clone.querySelectorAll("input, select").forEach((field) => {
      field.value = "";
      field.id = field.id.replace(/-\d+$/, "-" + index);
    });
    clone.querySelectorAll("label").forEach((label) => {
      label.htmlFor = label.htmlFor.replace(/-\d+$/, "-" + index);
    });
    container.insertBefore(clone, errorHint);
    clone.querySelector("select").focus();
  }

  document.querySelector("#add-time").addEventListener("click", cloneField);
})();
/* Fim de addField.js */
