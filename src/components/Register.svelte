<script>
  let email = "";
  let password = "";
  let error = "";

  const handleLogin = async () => {
    error = "";
    if (!email || !password) {
      error = "Please enter email and password.";
      return;
    }

    try {
      // Simulate API call
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      alert("Login successful!");
    } catch (err) {
      error = err.message;
    }
  };
</script>

<div class="register">
  <h2>Login</h2>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  <input type="email" placeholder="Email" bind:value={email} />
  <input type="password" placeholder="Password" bind:value={password} />
  <button on:click={handleLogin}>Login</button>
</div>

<style>
  .register {
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
