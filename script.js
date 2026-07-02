// Waitlist backend — create a free form at https://formspree.io,
// then replace YOUR_FORM_ID below with the real form ID (see README).
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

// Hero stack: scattered → tidy shortly after load
window.addEventListener("load", () => {
  const stack = document.querySelector("[data-stack]");
  if (stack) {
    setTimeout(() => stack.classList.add("is-tidy"), 700);
  }
});

// Waitlist forms: fetch submit with inline status
document.querySelectorAll("[data-waitlist]").forEach((form) => {
  const note = form.querySelector(".form-note");
  const button = form.querySelector("button");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    note.className = "form-note";
    note.textContent = "";
    button.disabled = true;

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      note.classList.add("is-success");
      note.textContent = "You're on the list. We'll email you when Stash is ready.";
      form.reset();
    } catch {
      note.classList.add("is-error");
      note.textContent = "Something went wrong. Please try again in a moment.";
    } finally {
      button.disabled = false;
    }
  });
});
