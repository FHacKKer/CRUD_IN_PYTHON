let allUsers = [];
let accessToken = window.location.search.split("?")[1].split("=")[1];
const verifyAccessToken = async (token) => {
  try {
    const req = await fetch(`/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await req.json();

    return res;
  } catch (error) {
    console.log(error);
    return { success: false, message: "Invalid Access Token" };
  }
};

const getUsers = async (token) => {
  try {
    const req = await fetch(`/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await req.json();

    return res;
  } catch (error) {
    console.log(error);
    return { success: false, message: "Invalid Access Token" };
  }
};

const insertUser = async ({ name, username, email, accessToken: token }) => {
  try {
    const req = await fetch(`/addUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, username, email }),
    });

    const insertUserResponse = await req.json();

    if (insertUserResponse.success) {
      return { success: true };
    } else {
      return { success: false, message: insertUserResponse.message };
    }
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to add user" };
  }
};

const renderUsers = (users) => {
  const usersTable = document.getElementById("userTable");
  usersTable.innerHTML = "";

  if (users.length === 0) {
    usersTable.innerHTML = `<tr>
      <td>No User Found</td>
      <td>No User Found</td>
      <td>No User Found</td>
      <td>No User Found</td>
      <td>No User Found</td>
      <td>No User Found</td>
    <tr>`;
    return;
  }

  users.forEach((user) => {
    const row = document.createElement("tr");

    let id_td = document.createElement("td");
    id_td.textContent = user?.id;

    let name_td = document.createElement("td");
    name_td.textContent = user?.name;

    let email_td = document.createElement("td");
    email_td.textContent = user?.email;

    let username_td = document.createElement("td");
    username_td.textContent = user?.username;

    let created_at_td = document.createElement("td");
    created_at_td.textContent = user?.created_at;

    let buttons_td = document.createElement("td");

    let editButton = createButton("Edit", "btn-outline-primary", () =>
      updateUser(user)
    );

    let deleteButton = createButton("Delete", "btn-outline-danger", () =>
      deleteUser(user)
    );

    buttons_td.appendChild(editButton);
    buttons_td.appendChild(deleteButton);

    row.appendChild(id_td);
    row.appendChild(name_td);
    row.appendChild(username_td);
    row.appendChild(email_td);
    row.appendChild(created_at_td);
    row.appendChild(buttons_td);

    usersTable.appendChild(row);
  });
};

const updateUser = async (user) => {
  try {
    console.log(user.id);
    if (!user) {
      console.warn(`Invalid user!`);
      return;
    }

    const nameInput = document.getElementById("updateUser_name");
    const usernameInput = document.getElementById("updateUser_username");
    const emailInput = document.getElementById("updateUser_email");
    let updateButton = document.getElementById("updateUser_button");
    const errorDiv = document.getElementById("updateUserErrorDiv");

    // Set initial values
    nameInput.value = user?.name;
    usernameInput.value = user?.username;
    emailInput.value = user?.email;

    // Function to enable/disable update button
    const enableUpdateButton = () => {
      updateButton.removeAttribute("disabled");
    };
    const disableUpdateButton = () => {
      updateButton.setAttribute("disabled", true);
    };

    // Function to handle input changes
    const handleInputChange = () => {
      if (
        nameInput.value !== user.name ||
        usernameInput.value !== user.username ||
        emailInput.value !== user.email
      ) {
        enableUpdateButton();
      } else {
        disableUpdateButton();
      }
    };

    // Event listeners on input fields
    nameInput.addEventListener("input", handleInputChange);
    usernameInput.addEventListener("input", handleInputChange);
    emailInput.addEventListener("input", handleInputChange);

    const updateUserModal = new bootstrap.Modal("#updateUserModal");
    updateUserModal.show();

    // Remove existing event listeners by cloning the button
    let newUpdateButton = updateButton.cloneNode(true);
    updateButton.replaceWith(newUpdateButton);
    updateButton = newUpdateButton;

    updateButton.addEventListener("click", async (e) => {
      e.preventDefault();
      let params = {
        name: nameInput.value.trim(),
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        id: user.id,
      };
      const req = await fetch("/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(params),
      });

      const res = await req.json();
      console.log(res); // Log response from server
      if (res.success) {
        await updateUsersList();
        updateUserModal.hide(); // Close modal after update
      } else {
        console.warn(res.message);
        errorDiv.textContent = res.message;
        errorDiv.classList.remove("opacity-0");
        setTimeout(() => {
          errorDiv.classList.add("opacity-0");
        }, 2500);
      }
    });
  } catch (error) {
    console.error(`An Error Occurred: ${error}`);
  }
};

const deleteUser = async (user) => {
  const deleteModal = new bootstrap.Modal("#deleteModal");
  let user_name_span = document.getElementById("deleteUser_name");
  let confirmDelButton = document.getElementById("confirmDeleteButton");

  user_name_span.textContent = user.username;
  deleteModal.show();

  let newDeleteButton = confirmDelButton.cloneNode(true);
  confirmDelButton.replaceWith(newDeleteButton);
  confirmDelButton = newDeleteButton;

  confirmDelButton.addEventListener("click", async (e) => {
    e.preventDefault();
    alert("Will be Added Soon!");
    return;

    const req = await fetch("/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: user.id,
      }),
    });

    const res = await req.json();

    if (res.success) {
      await updateUsersList();
      deleteModal.hide();
    } else {
      console.warn(res.message);
      alert(res.message);
    }
  });
};

const openAddUserModal = () => {
  let addUserModal = new bootstrap.Modal("#addUserModal");
  addUserModal.show();
};

const handleAddUser = async (accessToken) => {
  const spinner = `<div class="spinner-border spinner-border-sm" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>`;

  const insertUserButton = document.getElementById("addUser_button");
  const errorDiv = document.getElementById("addUserModalErrorDiv");

  insertUserButton.disabled = true;
  insertUserButton.innerHTML = spinner;

  try {
    let name = document.getElementById("newUser_name").value.trim();
    let username = document.getElementById("newUser_username").value.trim();
    let email = document.getElementById("newUser_email").value.trim();

    if (!name || !username || !email) {
      throw new Error("Please fill all the fields");
    }

    const insertUserResponse = await insertUser({
      name,
      username,
      email,
      accessToken,
    });

    if (!insertUserResponse.success) {
      throw new Error(insertUserResponse.message);
    }

    errorDiv.textContent = "User Inserted Successfully!";
    errorDiv.classList.remove("opacity-0");
    errorDiv.classList.remove("bg-danger");
    errorDiv.classList.add("bg-info");

    setTimeout(() => {
      errorDiv.classList.add("opacity-0");
      errorDiv.classList.remove("bg-info");
      document.getElementById("closeAddUserModalBtn").click();
    }, 2000);

    await updateUsersList();
  } catch (error) {
    console.log(`An Error Occured: ${error.message}`);
    errorDiv.textContent = error.message;
    errorDiv.classList.remove("opacity-0");
    setTimeout(() => {
      errorDiv.classList.add("opacity-0");
    }, 2500);
  } finally {
    insertUserButton.disabled = false;
    insertUserButton.innerHTML = "Add User";
  }
};

const updateUsersList = async () => {
  let accessToken = window.location.search.split("?")[1].split("=")[1];

  if (!accessToken) window.location.href = "/";

  try {
    const verifyAccessTokenResponse = await verifyAccessToken(accessToken);

    if (!verifyAccessTokenResponse.success) {
      return (window.location.href = "/");
    }

    const getUsersResponse = await getUsers(accessToken);

    if (!getUsersResponse.success) {
      return (window.location.href = "/");
    }

    const { users } = getUsersResponse;
    allUsers = users;
    renderUsers(allUsers);
  } catch (error) {
    console.log("Error updating user list:", error);
    window.location.href = "/";
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  if (!accessToken) window.location.href = "/";

  const verifyAccessTokenResponse = await verifyAccessToken(accessToken);

  if (!verifyAccessTokenResponse.success) {
    return (window.location.href = "/");
  }

  document.getElementById("loadingSpinner").classList.remove("active");

  const getUsersResponse = await getUsers(accessToken);

  if (!getUsersResponse.success) {
    return (window.location.href = "/");
  }

  allUsers = getUsersResponse.users; // Store users in a variable accessible to search

  renderUsers(allUsers);

  const searchBox = document.getElementById("searchBox");
  searchBox.addEventListener("input", (e) => {
    let searchTerm = e.target.value.toLowerCase();
    const filteredUsers = allUsers.filter((user) => {
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    });

    renderUsers(filteredUsers);
  });

  const addUserModalButton = document.getElementById("addUserTrigger");
  addUserModalButton.addEventListener("click", openAddUserModal);

  const insertUserButton = document.getElementById("addUser_button");
  insertUserButton.addEventListener("click", () => handleAddUser(accessToken));
});

function createButton(text, classes, clickHandler) {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-sm", classes, "my-1", "w-100");
  button.textContent = text;
  button.addEventListener("click", clickHandler);
  return button;
}
