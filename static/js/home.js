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

const insetUser = async ({ name, username, email, accessToken: token }) => {
  // console.log(`Name is : ${name}`);
  // console.log(`Username is : ${username}`);
  // console.log(`Email is : ${email}`);
  // console.log(`Token is : ${token}`);

  const req = await fetch(`/addUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, username, email }),
  });

  // if (!req.ok) {
  //   return { success: false, message:  `Failed To Add User!` };
  // }

  return await req.json();
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

    let editButton = document.createElement("button");
    editButton.classList.add("btn");
    editButton.classList.add("btn-sm");
    editButton.classList.add("btn-outline-primary");
    editButton.classList.add("my-1");
    editButton.classList.add("w-100");
    editButton.setAttribute("data-user-id", user.id);
    editButton.textContent = "Edit";

    editButton.addEventListener("click", (e) => {
      e.preventDefault();

      let user_data_id = e.target.getAttribute("data-user-id");

      if (!user_data_id) return console.warn(`User Not Found!`);
      const user = users.find((user) => user.id == user_data_id);
      if (!user) return console.warn(`User Not Found!`);

      editUser(user).then(() => {
        console.log(`User Edited successfully!`);
      });
    });

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("btn");
    deleteButton.classList.add("btn-sm");
    deleteButton.setAttribute("data-user-id", user.id);
    deleteButton.classList.add("btn-outline-danger");
    deleteButton.classList.add("my-1");
    deleteButton.classList.add("w-100");
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", (e) => {
      e.preventDefault();

      let user_data_id = e.target.getAttribute("data-user-id");

      if (!user_data_id) return console.warn(`User Not Found!`);
      const user = users.find((user) => user.id == user_data_id);
      if (!user) return console.warn(`User Not Found!`);

      deleteUser(user).then(() => {
        console.log(`User Deleted successfully!`);
      });
    });

    row.appendChild(id_td);
    row.appendChild(name_td);
    row.appendChild(username_td);
    row.appendChild(email_td);
    row.appendChild(created_at_td);
    row.appendChild(editButton);
    row.appendChild(deleteButton);

    let buttonTd = document.createElement("td");
    buttonTd.appendChild(editButton);
    buttonTd.appendChild(deleteButton);

    row.appendChild(buttonTd);

    usersTable.appendChild(row);
  });
};

const updateUsersList = async (allUsers) => {
  let accessToken = window.location.search.split("?")[1].split("=")[1];

  if (!accessToken) window.location.href = "/";

  const usersResponse = await getUsers(accessToken);
  console.log(usersResponse);
  if (!usersResponse.success) {
    return (window.location.href = "/");
  }
  if (usersResponse.users) {
    allUsers = usersResponse?.users;
    renderUsers(usersResponse?.users);
  }
};

const editUser = async (user) => {
  console.log(user);
};

const deleteUser = async (user) => {
  console.log(user);
};

document.addEventListener("DOMContentLoaded", async () => {
  const searchBox = document.getElementById("searchBox");
  const spinner = `<div class="spinner-border spinner-border-sm" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`;

  let allUsers;
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

  const { success, users } = getUsersResponse;
  allUsers = users;
  renderUsers(users);

  // display add user modal on button click
  const addUserModalButton = document.getElementById("addButton");
  addUserModalButton.addEventListener("click", (e) => {
    let addUserModal = new bootstrap.Modal("#addUserModal");
    addUserModal.show();
  });

  // code to insert user in database
  const insertUserButton = document.getElementById("addUser_button");
  const errorDiv = document.getElementById("addUserModalErrorDiv");
  insertUserButton.addEventListener("click", async (e) => {
    try {
      insertUserButton.disabled = true;
      insertUserButton.innerHTML = spinner;

      e.preventDefault();

      let name = document.getElementById("newUser_name").value.trim();
      let username = document.getElementById("newUser_username").value.trim();
      let email = document.getElementById("newUser_email").value.trim();

      if (!name || !username || !email) {
        errorDiv.textContent = "Please fill all the fields";
        if (errorDiv.classList.contains("opacity-0")) {
          errorDiv.classList.remove("opacity-0");
          setTimeout(() => {
            errorDiv.classList.add("opacity-0");
          }, 2500);
        }
        return;
      }
      name.value = "";
      username.value = "";
      email.value = "";

      const insetUserResponse = await insetUser({
        name,
        username,
        email,
        accessToken,
      });

      console.log(insetUserResponse);

      if (!insetUserResponse.success) {
        errorDiv.textContent = insetUserResponse.message;
        if (errorDiv.classList.contains("opacity-0")) {
          errorDiv.classList.remove("opacity-0");
          setTimeout(() => {
            errorDiv.classList.add("opacity-0");
          }, 2500);
        }
        return;
      }

      errorDiv.textContent = "User Inserted Successfully!";
      if (errorDiv.classList.contains("opacity-0")) {
        errorDiv.classList.remove("opacity-0");
        errorDiv.classList.remove("bg-danger");
        errorDiv.classList.add("bg-info");
        setTimeout(() => {
          errorDiv.classList.add("opacity-0");
          errorDiv.classList.remove("bg-info");
          document.getElementById("closeAddUserModalBtn").click();
        }, 2000);
      }

      updateUsersList(allUsers).then(() => console.log(`Users List Updated!`));
    } catch (error) {
      console.log(`An Error Occured: ${error.message}`);
    } finally {
      insertUserButton.disabled = false;
      insertUserButton.innerHTML = "Add User";
    }
  });
});
