document.addEventListener("DOMContentLoaded", function () {
  const usernameField = document.getElementById("username");
  const passwordField = document.getElementById("password");
  const loginButton = document.getElementById("signinButton");

  loginButton.addEventListener("click", async function (e) {
    e.preventDefault();
    const username = usernameField.value.trim();
    const password = passwordField.value.trim();

    if (!username || !password) {
      console.log("Please enter a username and password");
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
      console.log(res.message);
    }
  });
});
