let allUsers = [];
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
    console.log(user);
    if (!user) {
      return console.warn(`Invalid user!`);
    }

    const nameInput = document.getElementById("updateUser_name");
    const usernameInput = document.getElementById("updateUser_username");
    const emailInput = document.getElementById("updateUser_email");
    const updateButton = document.getElementById("updateUser_button");

    nameInput.value = user?.name;
    usernameInput.value = user?.username;
    emailInput.value = user?.email;

    // Function to enable update button
    const enableUpdateButton = () => {
      updateButton.removeAttribute("disabled");
    };
    const disableUpdateButton = () => {
      updateButton.setAttribute("disabled", true);
    };

    // Event listeners on input fields
    nameInput.addEventListener("input", () => {
      if (
        nameInput.value !== user.name ||
        usernameInput.value !== user.username ||
        emailInput.value !== user.email
      ) {
        enableUpdateButton();
      } else {
        disableUpdateButton();
      }
    });
    usernameInput.addEventListener("input", () => {
      if (
        nameInput.value !== user.name ||
        usernameInput.value !== user.username ||
        emailInput.value !== user.email
      ) {
        enableUpdateButton();
      } else {
        disableUpdateButton();
      }
    });
    emailInput.addEventListener("input", () => {
      if (
        nameInput.value !== user.name ||
        usernameInput.value !== user.username ||
        emailInput.value !== user.email
      ) {
        enableUpdateButton();
      } else {
        disableUpdateButton();
      }
    });

    const updateUserModal = new bootstrap.Modal("#updateUserModal");
    updateUserModal.show();
  } catch (error) {
    console.log(`An Error Occured: ${error}`);
  }
};

const deleteUser = async (user) => {
  console.log(user);
  // Implement delete logic here
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
  let accessToken = window.location.search.split("?")[1].split("=")[1];

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
