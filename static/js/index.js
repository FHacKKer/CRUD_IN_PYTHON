document.addEventListener("DOMContentLoaded", function () {
  const usernameField = document.getElementById("username");
  const passwordField = document.getElementById("password");
  const loginButton = document.getElementById("signinButton");
  const errorDiv = document.getElementById("errorDiv");

  const spinner = `<div class="spinner-border spinner-border-sm" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`;

  loginButton.addEventListener("click", async function (e) {
    try {
      loginButton.innerHTML = spinner;
      loginButton.disabled = true;
      e.preventDefault();
      const username = usernameField.value.trim();
      const password = passwordField.value.trim();

      if (!username || !password) {
        console.log("Please enter a username and password");
        errorDiv.textContent = "Please enter a username and password";
        if (!errorDiv.classList.contains("active")) {
          errorDiv.classList.add("active");
          errorDiv.classList.add("bg-danger");
          setTimeout(() => {
            errorDiv.classList.remove("active");
            errorDiv.classList.remove("bg-danger");
            errorDiv.textContent = "";
          }, 2500);
          return;
        }
        return;
      }

      const credentials = {
        username: username,
        password: password,
      };

      const req = await fetch(`/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const res = await req.json();
      if (res.success) {
        location.href = `/home?access_token=${res?.token}`;
      } else {
        errorDiv.textContent = res.message;
        if (!errorDiv.classList.contains("active")) {
          errorDiv.classList.add("active");
          errorDiv.classList.add("bg-danger");
          setTimeout(() => {
            errorDiv.classList.remove("active");
            errorDiv.classList.remove("bg-danger");
            errorDiv.textContent = "";
          }, 2500);
          return;
        }
        console.log(res.message);
      }
    } catch (error) {
      console.log(`An Error occurred : ${error.message}`);
    } finally {
      loginButton.innerHTML = "Sign In";
      loginButton.disabled = false;
    }
  });
});
