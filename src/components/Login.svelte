<script>
  let name = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let error = "";

  const handleRegister = async () => {
    error = "";
    if (!name || !email || !password || !confirmPassword) {
      error = "All fields are required.";
      return;
    }

    if (password !== confirmPassword) {
      error = "Passwords do not match.";
      return;
    }

    try {
      // Simulate API call
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      alert("Registration successful!");
    } catch (err) {
      error = err.message;
    }
  };
</script>

<div class="login">
  <h2>Register</h2>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  <input type="text" placeholder="Name" bind:value={name} />
  <input type="email" placeholder="Email" bind:value={email} />
  <input type="password" placeholder="Password" bind:value={password} />
  <input
    type="password"
    placeholder="Confirm Password"
    bind:value={confirmPassword}
  />
  <button on:click={handleRegister}>Register</button>
</div>

<style>
  .login {
    width: 300px;
    margin: auto;
    text-align: center;
  }
  input {
    display: block;
    width: 100%;
    margin: 8px 0;
    padding: 8px;
  }
  .error {
    color: red;
  }
</style>
